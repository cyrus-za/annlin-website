#!/usr/bin/env tsx

import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { Readable } from 'node:stream'
import type { ReadableStream as NodeReadableStream } from 'node:stream/web'
import { prisma, disconnectDatabase } from '../lib/db'

type ResidualAsset = {
  sourceUrl: string
  filename: string
}

type WranglerCommand = {
  command: string
  args: string[]
}

const USER_AGENT = 'Annlin WordPress residual asset migration'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value.replace(/\/+$/, '')
}

function normalizedPublicBaseUrl() {
  return requiredEnv('R2_PUBLIC_BASE_URL')
}

function resolveWranglerCommand(): WranglerCommand {
  const localWrangler = join(process.cwd(), 'node_modules', '.bin', 'wrangler')
  if (existsSync(localWrangler)) {
    return { command: localWrangler, args: [] }
  }

  const globalWrangler = spawnSync('wrangler', ['--version'], {
    stdio: 'ignore',
  })
  if (globalWrangler.status === 0) {
    return { command: 'wrangler', args: [] }
  }

  return { command: 'npx', args: ['--yes', 'wrangler'] }
}

const wranglerCommand = resolveWranglerCommand()

function filenameFromUrl(value: string) {
  return decodeURIComponent(new URL(value).pathname.split('/').filter(Boolean).pop() || '')
}

function encodeObjectPath(pathname: string) {
  return pathname
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}

function runWranglerUpload(
  objectPath: string,
  contentType: string,
  body: ReadableStream<Uint8Array>
) {
  return new Promise<number>((resolve, reject) => {
    const child = spawn(
      wranglerCommand.command,
      [
        ...wranglerCommand.args,
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

function extractWordPressUploadUrls(value: string | null | undefined) {
  if (!value) return []

  const matches = value.match(/https?:\/\/(?:www\.)?annlin\.co\.za\/wp-content\/uploads\/[^\s<>"')\]]+/gi)
  return [...new Set((matches || []).map((url) => url.replace(/^http:/i, 'https:')))]
}

function replaceAllReferences(value: string | null | undefined, replacements: Map<string, string>) {
  if (!value) return value

  let updated = value
  for (const [source, target] of replacements) {
    updated = updated.replaceAll(source, target).replaceAll(source.replace(/^https:/i, 'http:'), target)
  }

  return updated
}

async function collectResidualAssets() {
  const [serviceGroups, articles, readingMaterials] = await Promise.all([
    prisma.serviceGroup.findMany(),
    prisma.article.findMany(),
    prisma.readingMaterial.findMany(),
  ])

  const urls = new Map<string, ResidualAsset>()
  const add = (value: string | null | undefined) => {
    for (const sourceUrl of extractWordPressUploadUrls(value)) {
      urls.set(sourceUrl, { sourceUrl, filename: filenameFromUrl(sourceUrl) })
    }
  }

  for (const group of serviceGroups) {
    add(group.description)
    add(group.thumbnailUrl)
    add(group.bannerUrl)
  }

  for (const article of articles) {
    add(article.content)
    add(article.excerpt)
    add(article.featuredImageUrl)
  }

  for (const item of readingMaterials) {
    add(item.description)
    add(item.fileUrl)
    add(item.externalUrl)
  }

  return [...urls.values()]
}

function parseUrlArguments() {
  return process.argv
    .filter((value) => value.startsWith('--url='))
    .map((value) => value.slice('--url='.length).trim())
    .filter(Boolean)
    .map((sourceUrl) => ({ sourceUrl, filename: filenameFromUrl(sourceUrl) }))
}

async function main() {
  const bucket = requiredEnv('R2_BUCKET_NAME')
  const publicBaseUrl = normalizedPublicBaseUrl()
  const explicitAssets = parseUrlArguments()
  const assets = explicitAssets.length > 0 ? explicitAssets : await collectResidualAssets()
  const replacements = new Map<string, string>()
  const uploaded = []

  for (const asset of assets) {
    const stableHash = createHash('sha1').update(asset.sourceUrl).digest('hex').slice(0, 12)
    const assetId = `wp-residual-${stableHash}`
    const existing = await prisma.uploadedAsset.findUnique({ where: { id: assetId } })

    if (existing?.url) {
      replacements.set(asset.sourceUrl, existing.url)
      continue
    }

    const response = await fetch(asset.sourceUrl, {
      headers: { 'user-agent': USER_AGENT },
    })
    if (!response.ok || !response.body) {
      throw new Error(`Residual asset fetch failed ${response.status}: ${asset.sourceUrl}`)
    }

    const pathname = `wordpress-media/residual/${stableHash}-${asset.filename}`
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const size = await runWranglerUpload(`${bucket}/${pathname}`, contentType, response.body)
    const url = `${publicBaseUrl}/${encodeObjectPath(pathname)}`

    await prisma.uploadedAsset.upsert({
      where: { id: assetId },
      update: {
        url,
        pathname,
        filename: asset.filename,
        mimeType: contentType,
        size,
        purpose: 'wordpress-residual-asset',
      },
      create: {
        id: assetId,
        url,
        pathname,
        filename: asset.filename,
        mimeType: contentType,
        size,
        purpose: 'wordpress-residual-asset',
      },
    })

    replacements.set(asset.sourceUrl, url)
    uploaded.push({ sourceUrl: asset.sourceUrl, url, size })
  }

  const [serviceGroups, articles, readingMaterials] = await Promise.all([
    prisma.serviceGroup.findMany(),
    prisma.article.findMany(),
    prisma.readingMaterial.findMany(),
  ])

  let rewrittenRecords = 0
  for (const group of serviceGroups) {
    const description = replaceAllReferences(group.description, replacements)
    const thumbnailUrl = replaceAllReferences(group.thumbnailUrl, replacements)
    const bannerUrl = replaceAllReferences(group.bannerUrl, replacements)
    if (
      description !== group.description ||
      thumbnailUrl !== group.thumbnailUrl ||
      bannerUrl !== group.bannerUrl
    ) {
      await prisma.serviceGroup.update({
        where: { id: group.id },
        data: { description, thumbnailUrl, bannerUrl },
      })
      rewrittenRecords++
    }
  }

  for (const article of articles) {
    const content = replaceAllReferences(article.content, replacements) || article.content
    const excerpt = replaceAllReferences(article.excerpt, replacements)
    const featuredImageUrl = replaceAllReferences(article.featuredImageUrl, replacements)
    if (
      content !== article.content ||
      excerpt !== article.excerpt ||
      featuredImageUrl !== article.featuredImageUrl
    ) {
      await prisma.article.update({
        where: { id: article.id },
        data: { content, excerpt, featuredImageUrl },
      })
      rewrittenRecords++
    }
  }

  for (const item of readingMaterials) {
    const description = replaceAllReferences(item.description, replacements)
    const fileUrl = replaceAllReferences(item.fileUrl, replacements)
    const externalUrl = replaceAllReferences(item.externalUrl, replacements)
    if (
      description !== item.description ||
      fileUrl !== item.fileUrl ||
      externalUrl !== item.externalUrl
    ) {
      await prisma.readingMaterial.update({
        where: { id: item.id },
        data: { description, fileUrl, externalUrl },
      })
      rewrittenRecords++
    }
  }

  console.log(
    JSON.stringify(
      {
        residualAssetsDiscovered: assets.length,
        uploadedResidualAssets: uploaded.length,
        skippedExistingResidualAssets: assets.length - uploaded.length,
        rewrittenRecords,
        uploaded,
      },
      null,
      2
    )
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase()
  })
