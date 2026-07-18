#!/usr/bin/env tsx

import { put } from '@vercel/blob'
import { Prisma } from '@prisma/client'
import { spawn } from 'node:child_process'
import { Readable } from 'node:stream'
import type { ReadableStream as NodeReadableStream } from 'node:stream/web'
import { disconnectDatabase, prisma } from '../lib/db'

type WpMediaSize = {
  file?: string
  source_url?: string
}

type WpMedia = {
  id: number
  slug: string
  source_url: string
  mime_type: string
  date?: string
  modified?: string
  media_details?: {
    file?: string
    filesize?: number
    original_image?: string
    sizes?: Record<string, WpMediaSize>
  }
}

type SizeResult = {
  bytes: number | null
  source: 'wordpress' | 'head' | 'range' | 'unresolved'
}

type ExistingAsset = {
  id: string
  url: string
  pathname: string | null
  size: number
}

type StorageProvider = 'vercel' | 'r2'

type ArchivedObject = {
  url: string
  pathname: string
  size: number
}

const USER_AGENT = 'Annlin WordPress media migration'
const VERCEL_HOBBY_BLOB_LIMIT_BYTES = 1_000_000_000
const MULTIPART_THRESHOLD_BYTES = 5 * 1024 * 1024

function env(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value.replace(/\/+$/, '')
}

function hasUsableBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  return Boolean(token && token !== 'dev_blob_token_placeholder' && token !== 'vercel_blob_token_here')
}

function parseConcurrency() {
  const argument = process.argv.find((value) => value.startsWith('--size-concurrency='))
  const parsed = Number(argument?.split('=')[1] || 8)
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 20) : 8
}

function parseMediaLimit() {
  const argument = process.argv.find((value) => value.startsWith('--limit='))
  if (!argument) return null

  const parsed = Number(argument.split('=')[1])
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('--limit must be a positive integer.')
  }

  return parsed
}

function parseStorageProvider(): StorageProvider {
  const argument = process.argv.find((value) => value.startsWith('--storage='))
  const provider = argument?.split('=')[1] || 'vercel'

  if (provider !== 'vercel' && provider !== 'r2') {
    throw new Error(`Unsupported storage provider: ${provider}`)
  }

  return provider
}

function decodeEntities(value: string) {
  let decoded = value

  for (let index = 0; index < 2; index++) {
    decoded = decoded
      .replaceAll('&amp;', '&')
      .replaceAll('&#038;', '&')
      .replaceAll('&quot;', '"')
      .replaceAll('&#8220;', '"')
      .replaceAll('&#8221;', '"')
      .replaceAll('&#8216;', "'")
      .replaceAll('&#8217;', "'")
      .replaceAll('&#x27;', "'")
      .replaceAll('&#8211;', '-')
      .replaceAll('&#8212;', '-')
      .replaceAll('&#8230;', '...')
      .replaceAll('&nbsp;', ' ')
  }

  return decoded
}

function pathnameFromUrl(url: string, fallback: string) {
  try {
    const parsed = new URL(url)
    return decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || fallback)
  } catch {
    return fallback
  }
}

function formatBytes(bytes: number | null) {
  if (bytes === null) return 'unknown'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0

  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000
    unit++
  }

  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`
}

function isBlobUrl(value: string) {
  try {
    return new URL(value).hostname.endsWith('.blob.vercel-storage.com')
  } catch {
    return false
  }
}

function normalizedPublicBaseUrl() {
  return process.env['R2_PUBLIC_BASE_URL']?.replace(/\/+$/, '') || null
}

function isR2Url(value: string) {
  const publicBaseUrl = normalizedPublicBaseUrl()
  return Boolean(publicBaseUrl && (value === publicBaseUrl || value.startsWith(`${publicBaseUrl}/`)))
}

function isArchivedUrl(value: string, provider: StorageProvider) {
  return provider === 'vercel' ? isBlobUrl(value) : isR2Url(value)
}

function encodeObjectPath(pathname: string) {
  return pathname
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}

async function fetchJson<T>(url: string): Promise<{ data: T; totalPages: number; total: number }> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': USER_AGENT,
    },
  })

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status}: ${url}`)
  }

  return {
    data: (await response.json()) as T,
    total: Number(response.headers.get('x-wp-total') || 0),
    totalPages: Number(response.headers.get('x-wp-totalpages') || 1),
  }
}

async function fetchAllMedia(wordpressBaseUrl: string) {
  const fields = 'id,slug,source_url,mime_type,date,modified,media_details'
  const first = await fetchJson<WpMedia[]>(
    `${wordpressBaseUrl}/wp-json/wp/v2/media?per_page=100&page=1&_fields=${fields}`
  )

  const media = [...first.data]

  for (let page = 2; page <= first.totalPages; page++) {
    const next = await fetchJson<WpMedia[]>(
      `${wordpressBaseUrl}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=${fields}`
    )
    media.push(...next.data)
  }

  return media
}

function responseSize(response: Response) {
  const contentRange = response.headers.get('content-range')
  const rangeTotal = contentRange?.match(/\/(\d+)$/)?.[1]
  const contentLength = response.headers.get('content-length')
  const parsed = Number(rangeTotal || contentLength || 0)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

async function probeMediaSize(media: WpMedia): Promise<SizeResult> {
  const wordpressSize = Number(media.media_details?.filesize || 0)
  if (wordpressSize > 0) {
    return { bytes: wordpressSize, source: 'wordpress' }
  }

  try {
    const response = await fetch(media.source_url, {
      method: 'HEAD',
      headers: { 'user-agent': USER_AGENT },
    })
    const bytes = response.ok ? responseSize(response) : null
    await response.body?.cancel()
    if (bytes !== null) return { bytes, source: 'head' }
  } catch {
    // Some older WordPress hosts reject HEAD requests; the range fallback handles those files.
  }

  try {
    const response = await fetch(media.source_url, {
      headers: {
        range: 'bytes=0-0',
        'accept-encoding': 'identity',
        'user-agent': USER_AGENT,
      },
    })
    const bytes = response.ok ? responseSize(response) : null
    await response.body?.cancel()
    if (bytes !== null) return { bytes, source: 'range' }
  } catch {
    // Report the unresolved item below rather than treating an estimate as exact.
  }

  return { bytes: null, source: 'unresolved' }
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>
) {
  const results = new Array<R>(values.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex++
      results[index] = await mapper(values[index]!, index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()))
  return results
}

async function resolveMediaSizes(media: WpMedia[], concurrency: number) {
  const results = await mapWithConcurrency(media, concurrency, async (item, index) => {
    const result = await probeMediaSize(item)
    if ((index + 1) % 50 === 0 || index + 1 === media.length) {
      console.error(`Size preflight: ${index + 1}/${media.length}`)
    }
    return result
  })

  return new Map(media.map((item, index) => [item.id, results[index]!]))
}

function printPreflight(media: WpMedia[], sizeById: Map<number, SizeResult>) {
  const resolved = media.filter((item) => sizeById.get(item.id)?.bytes !== null)
  const unresolved = media.filter((item) => sizeById.get(item.id)?.bytes === null)
  const totalBytes = resolved.reduce((total, item) => total + (sizeById.get(item.id)?.bytes || 0), 0)
  const sourceCounts = [...sizeById.values()].reduce<Record<string, number>>((counts, item) => {
    counts[item.source] = (counts[item.source] || 0) + 1
    return counts
  }, {})
  const largest = resolved
    .map((item) => ({
      id: item.id,
      filename: pathnameFromUrl(item.source_url, item.slug),
      bytes: sizeById.get(item.id)?.bytes || 0,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 20)
    .map((item) => ({ ...item, formatted: formatBytes(item.bytes) }))

  console.log(
    JSON.stringify(
      {
        totalMedia: media.length,
        resolvedMedia: resolved.length,
        unresolvedMedia: unresolved.length,
        resolvedBytes: totalBytes,
        resolvedSize: formatBytes(totalBytes),
        vercelHobbyBlobLimitBytes: VERCEL_HOBBY_BLOB_LIMIT_BYTES,
        remainingBeforeHobbyLimitBytes: VERCEL_HOBBY_BLOB_LIMIT_BYTES - totalBytes,
        exactTotal: unresolved.length === 0,
        fitsEmptyVercelHobbyStore:
          unresolved.length === 0 && totalBytes <= VERCEL_HOBBY_BLOB_LIMIT_BYTES,
        sizeSources: sourceCounts,
        unresolved: unresolved.map((item) => ({ id: item.id, url: item.source_url })),
        largest,
      },
      null,
      2
    )
  )
}

async function copyToBlob(media: WpMedia, bytes: number) {
  const response = await fetch(media.source_url, {
    headers: { 'user-agent': USER_AGENT },
  })

  if (!response.ok || !response.body) {
    throw new Error(`Media fetch failed ${response.status}: ${media.source_url}`)
  }

  const filename = pathnameFromUrl(media.source_url, `${media.id}-${media.slug}`)
  const blobPath = `wordpress-media/${media.id}-${filename}`
  const contentType = response.headers.get('content-type') || media.mime_type || 'application/octet-stream'

  return put(blobPath, response.body, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 31_536_000,
    multipart: bytes >= MULTIPART_THRESHOLD_BYTES,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}

function runWranglerUpload(
  objectPath: string,
  contentType: string,
  body: ReadableStream<Uint8Array>
) {
  return new Promise<number>((resolve, reject) => {
    const child = spawn(
      'wrangler',
      [
        'r2',
        'object',
        'put',
        objectPath,
        '--remote',
        '--pipe',
        '--content-type',
        contentType,
        '--cache-control',
        'public, max-age=31536000, immutable',
      ],
      {
        env: {
          ...process.env,
          WRANGLER_LOG_PATH:
            process.env['WRANGLER_LOG_PATH'] || '/tmp/annlin-wrangler.log',
        },
        stdio: ['pipe', 'ignore', 'pipe'],
      }
    )
    let stderr = ''
    let uploadedBytes = 0

    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0 && uploadedBytes > 0) {
        resolve(uploadedBytes)
      } else if (code === 0) {
        reject(new Error(`Wrangler uploaded an empty R2 object: ${objectPath}`))
      } else {
        reject(new Error(`Wrangler R2 upload failed (${code ?? 'unknown'}): ${stderr.trim()}`))
      }
    })

    Readable.fromWeb(body as unknown as NodeReadableStream<Uint8Array>)
      .on('data', (chunk: Buffer) => {
        uploadedBytes += chunk.length
      })
      .on('error', reject)
      .pipe(child.stdin)
  })
}

async function copyToR2(media: WpMedia): Promise<ArchivedObject> {
  const bucket = process.env['R2_BUCKET_NAME']
  const publicBaseUrl = normalizedPublicBaseUrl()

  if (!bucket || !publicBaseUrl) {
    throw new Error(
      'R2_BUCKET_NAME and R2_PUBLIC_BASE_URL are required when using --storage=r2.'
    )
  }

  const response = await fetch(media.source_url, {
    headers: { 'user-agent': USER_AGENT },
  })

  if (!response.ok || !response.body) {
    throw new Error(`Media fetch failed ${response.status}: ${media.source_url}`)
  }

  const filename = pathnameFromUrl(media.source_url, `${media.id}-${media.slug}`)
  const pathname = `wordpress-media/${media.id}-${filename}`
  const contentType = response.headers.get('content-type') || media.mime_type || 'application/octet-stream'

  const size = await runWranglerUpload(`${bucket}/${pathname}`, contentType, response.body)

  return {
    pathname,
    url: `${publicBaseUrl}/${encodeObjectPath(pathname)}`,
    size,
  }
}

async function copyToStorage(media: WpMedia, bytes: number | null, provider: StorageProvider) {
  if (provider === 'vercel') {
    if (bytes === null) {
      throw new Error(`Cannot upload an unresolved-size file to Vercel Blob: ${media.source_url}`)
    }

    const blob = await copyToBlob(media, bytes)
    return { url: blob.url, pathname: blob.pathname, size: bytes }
  }

  const archivedObject = await copyToR2(media)
  if (bytes !== null && archivedObject.size !== bytes) {
    throw new Error(
      `R2 upload size mismatch for ${media.source_url}: expected ${bytes}, uploaded ${archivedObject.size}`
    )
  }

  return archivedObject
}

function mediaReferenceUrls(media: WpMedia, wordpressBaseUrl: string) {
  const urls = new Set<string>()
  const add = (value?: string) => {
    if (value) urls.add(decodeEntities(value))
  }

  add(media.source_url)
  for (const size of Object.values(media.media_details?.sizes || {})) {
    add(size.source_url)
  }

  const uploadsBase = `${wordpressBaseUrl}/wp-content/uploads/`
  add(media.media_details?.file ? `${uploadsBase}${media.media_details.file}` : undefined)

  if (media.media_details?.original_image) {
    try {
      add(new URL(media.media_details.original_image, media.source_url).toString())
    } catch {
      // source_url remains available as the canonical reference.
    }
  }

  return [...urls]
}

function urlVariants(value: string) {
  const variants = new Set([value, decodeEntities(value), value.replaceAll('&', '&amp;')])

  try {
    const parsed = new URL(value)
    const alternateScheme = new URL(value)
    alternateScheme.protocol = parsed.protocol === 'https:' ? 'http:' : 'https:'
    variants.add(alternateScheme.toString())
    variants.add(decodeURI(value))
  } catch {
    // Non-URL values do not need URL variants.
  }

  return [...variants].filter(Boolean)
}

function replaceMediaReferences(value: string, replacements: Map<string, string>) {
  let updated = value
  const sources = [...replacements.keys()].sort((a, b) => b.length - a.length)

  for (const source of sources) {
    const target = replacements.get(source)
    if (!target) continue

    for (const variant of urlVariants(source)) {
      updated = updated.replaceAll(variant, target)
    }
  }

  return updated
}

function replaceJsonReferences(value: unknown, replacements: Map<string, string>): unknown {
  if (typeof value === 'string') return replaceMediaReferences(value, replacements)
  if (Array.isArray(value)) return value.map((item) => replaceJsonReferences(item, replacements))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceJsonReferences(item, replacements)])
    )
  }
  return value
}

async function rewriteStoredReferences(replacements: Map<string, string>) {
  if (replacements.size === 0) {
    return { records: 0, fields: 0 }
  }

  let records = 0
  let fields = 0
  const rewrite = (value: string | null | undefined) =>
    value == null ? value : replaceMediaReferences(value, replacements)

  const serviceGroups = await prisma.serviceGroup.findMany()
  for (const item of serviceGroups) {
    const description = rewrite(item.description)!
    const thumbnailUrl = rewrite(item.thumbnailUrl)
    const bannerUrl = rewrite(item.bannerUrl)
    if (
      description !== item.description ||
      thumbnailUrl !== item.thumbnailUrl ||
      bannerUrl !== item.bannerUrl
    ) {
      fields += Number(description !== item.description)
      fields += Number(thumbnailUrl !== item.thumbnailUrl)
      fields += Number(bannerUrl !== item.bannerUrl)
      await prisma.serviceGroup.update({
        where: { id: item.id },
        data: { description, thumbnailUrl, bannerUrl },
      })
      records++
    }
  }

  const articles = await prisma.article.findMany()
  for (const item of articles) {
    const content = rewrite(item.content)!
    const excerpt = rewrite(item.excerpt)
    const featuredImageUrl = rewrite(item.featuredImageUrl)
    if (
      content !== item.content ||
      excerpt !== item.excerpt ||
      featuredImageUrl !== item.featuredImageUrl
    ) {
      fields += Number(content !== item.content)
      fields += Number(excerpt !== item.excerpt)
      fields += Number(featuredImageUrl !== item.featuredImageUrl)
      await prisma.article.update({
        where: { id: item.id },
        data: { content, excerpt, featuredImageUrl },
      })
      records++
    }
  }

  const readingMaterials = await prisma.readingMaterial.findMany()
  for (const item of readingMaterials) {
    const description = rewrite(item.description)
    const fileUrl = rewrite(item.fileUrl)
    const externalUrl = rewrite(item.externalUrl)
    if (
      description !== item.description ||
      fileUrl !== item.fileUrl ||
      externalUrl !== item.externalUrl
    ) {
      fields += Number(description !== item.description)
      fields += Number(fileUrl !== item.fileUrl)
      fields += Number(externalUrl !== item.externalUrl)
      await prisma.readingMaterial.update({
        where: { id: item.id },
        data: { description, fileUrl, externalUrl },
      })
      records++
    }
  }

  const events = await prisma.event.findMany()
  for (const item of events) {
    const description = rewrite(item.description)!
    const sermonUrl = rewrite(item.sermonUrl)
    if (description !== item.description || sermonUrl !== item.sermonUrl) {
      fields += Number(description !== item.description)
      fields += Number(sermonUrl !== item.sermonUrl)
      await prisma.event.update({
        where: { id: item.id },
        data: { description, sermonUrl },
      })
      records++
    }
  }

  const contentPages = await prisma.contentPage.findMany()
  for (const item of contentPages) {
    const sections = replaceJsonReferences(item.sections, replacements)
    if (JSON.stringify(sections) !== JSON.stringify(item.sections)) {
      await prisma.contentPage.update({
        where: { id: item.id },
        data: { sections: sections as Prisma.InputJsonValue },
      })
      records++
      fields++
    }
  }

  return { records, fields }
}

async function main() {
  const wordpressBaseUrl = env('WORDPRESS_BASE_URL')
  const dryRun = process.argv.includes('--dry-run')
  const copyFiles = process.argv.includes('--copy-files')
  const preflight = process.argv.includes('--preflight')
  const sizeConcurrency = parseConcurrency()
  const mediaLimit = parseMediaLimit()
  const storageProvider = parseStorageProvider()

  if (copyFiles && storageProvider === 'vercel' && !hasUsableBlobToken()) {
    throw new Error('A real BLOB_READ_WRITE_TOKEN is required when using --copy-files.')
  }

  if (
    copyFiles &&
    storageProvider === 'r2' &&
    (!process.env['R2_BUCKET_NAME'] || !normalizedPublicBaseUrl())
  ) {
    throw new Error(
      'R2_BUCKET_NAME and R2_PUBLIC_BASE_URL are required when using --storage=r2.'
    )
  }

  const allMedia = await fetchAllMedia(wordpressBaseUrl)
  const media = mediaLimit === null ? allMedia : allMedia.slice(0, mediaLimit)
  const sizeById = await resolveMediaSizes(media, sizeConcurrency)
  printPreflight(media, sizeById)

  if (preflight) return

  const unresolved = media.filter((item) => sizeById.get(item.id)?.bytes === null)
  if (copyFiles && storageProvider === 'vercel' && unresolved.length > 0) {
    throw new Error(
      `${unresolved.length} media files have an unresolved size. Refusing a partial archive upload.`
    )
  }

  const totalBytes = media.reduce((total, item) => total + (sizeById.get(item.id)?.bytes || 0), 0)
  if (
    copyFiles &&
    storageProvider === 'vercel' &&
    totalBytes > VERCEL_HOBBY_BLOB_LIMIT_BYTES
  ) {
    throw new Error(
      `The ${formatBytes(totalBytes)} WordPress archive exceeds the ${formatBytes(
        VERCEL_HOBBY_BLOB_LIMIT_BYTES
      )} Vercel Hobby Blob limit. No files were uploaded.`
    )
  }

  const existingAssets = dryRun
    ? []
    : await prisma.uploadedAsset.findMany({ where: { id: { startsWith: 'wp-media-' } } })
  const existingById = new Map<string, ExistingAsset>(
    existingAssets.map((item) => [item.id, item])
  )
  let copied = 0
  let skippedExisting = 0
  let inventoried = 0
  let failed = 0
  let archivedTotalBytes = 0
  const replacements = new Map<string, string>()

  for (const [index, item] of media.entries()) {
    try {
      const originalFilename = pathnameFromUrl(item.source_url, `${item.id}-${item.slug}`)
      const assetId = `wp-media-${item.id}`
      const existing = existingById.get(assetId)
      const expectedBytes = sizeById.get(item.id)?.bytes ?? null
      let archivedBytes = expectedBytes ?? 0
      let finalUrl = item.source_url
      let pathname = `wordpress-media/original/${item.id}-${originalFilename}`

      if (
        copyFiles &&
        existing &&
        isArchivedUrl(existing.url, storageProvider) &&
        (expectedBytes === null ? existing.size > 0 : existing.size === expectedBytes)
      ) {
        finalUrl = existing.url
        pathname = existing.pathname || pathname
        archivedBytes = existing.size
        skippedExisting++
      } else if (copyFiles) {
        const archivedObject = await copyToStorage(item, expectedBytes, storageProvider)
        finalUrl = archivedObject.url
        pathname = archivedObject.pathname
        archivedBytes = archivedObject.size
        copied++
      }

      if (isArchivedUrl(finalUrl, storageProvider)) {
        archivedTotalBytes += archivedBytes
        for (const sourceUrl of mediaReferenceUrls(item, wordpressBaseUrl)) {
          replacements.set(sourceUrl, finalUrl)
        }
      }

      if (!dryRun) {
        await prisma.uploadedAsset.upsert({
          where: { id: assetId },
          update: {
            url: finalUrl,
            pathname,
            filename: originalFilename,
            mimeType: item.mime_type,
            size: archivedBytes,
            purpose: 'wordpress-media-archive',
          },
          create: {
            id: assetId,
            url: finalUrl,
            pathname,
            filename: originalFilename,
            mimeType: item.mime_type,
            size: archivedBytes,
            purpose: 'wordpress-media-archive',
          },
        })

      }

      inventoried++
      if ((index + 1) % 25 === 0 || index + 1 === media.length) {
        console.error(`Media migration: ${index + 1}/${media.length}`)
      }
    } catch (error) {
      failed++
      console.error(
        JSON.stringify({
          id: item.id,
          url: item.source_url,
          error: error instanceof Error ? error.message : String(error),
        })
      )
    }
  }

  const rewritten = dryRun ? { records: 0, fields: 0 } : await rewriteStoredReferences(replacements)

  console.log(
    JSON.stringify(
      {
        totalMedia: media.length,
        totalBytes,
        totalSize: formatBytes(totalBytes),
        inventoried,
        copiedToStorage: copied,
        skippedExistingStorage: skippedExisting,
        archivedBytes: archivedTotalBytes,
        archivedSize: formatBytes(archivedTotalBytes),
        replacementUrls: replacements.size,
        rewrittenRecords: rewritten.records,
        rewrittenFields: rewritten.fields,
        failed,
        dryRun,
        copyFiles,
        storageProvider,
        mediaLimit,
      },
      null,
      2
    )
  )

  if (failed > 0) {
    process.exitCode = 1
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase()
  })
