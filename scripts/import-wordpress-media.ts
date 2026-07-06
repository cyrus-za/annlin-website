#!/usr/bin/env tsx

import { put } from '@vercel/blob'
import { ReadingMaterialFileType } from '@prisma/client'
import { disconnectDatabase, prisma } from '../lib/db'

type WpRendered = { rendered?: string }

type WpMedia = {
  id: number
  slug: string
  title: WpRendered
  source_url: string
  mime_type: string
  date?: string
  modified?: string
  media_details?: {
    filesize?: number
  }
}

const USER_AGENT = 'Annlin WordPress media migration'

function env(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value.replace(/\/+$/, '')
}

function hasUsableBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  return Boolean(token && token !== 'dev_blob_token_placeholder' && token !== 'vercel_blob_token_here')
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

function titleOf(media: WpMedia) {
  return decodeEntities(media.title?.rendered || media.slug)
}

function pathnameFromUrl(url: string, fallback: string) {
  try {
    const parsed = new URL(url)
    return decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || fallback)
  } catch {
    return fallback
  }
}

function fileTypeForMime(mimeType: string): ReadingMaterialFileType {
  if (mimeType === 'application/pdf') return ReadingMaterialFileType.PDF
  if (mimeType.includes('word') || mimeType.includes('presentation')) return ReadingMaterialFileType.DOC
  return ReadingMaterialFileType.LINK
}

function shouldExposeAsReadingMaterial(mimeType: string) {
  return (
    mimeType === 'application/pdf' ||
    mimeType === 'audio/mpeg' ||
    mimeType.includes('word') ||
    mimeType.includes('presentation')
  )
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
  const fields = 'id,slug,title,source_url,mime_type,date,modified,media_details'
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

async function copyToBlob(media: WpMedia) {
  const response = await fetch(media.source_url, {
    headers: {
      'user-agent': USER_AGENT,
    },
  })

  if (!response.ok) {
    throw new Error(`Media fetch failed ${response.status}: ${media.source_url}`)
  }

  const filename = pathnameFromUrl(media.source_url, `${media.id}-${media.slug}`)
  const blobPath = `wordpress-media/${media.id}-${filename}`
  const contentType = response.headers.get('content-type') || media.mime_type || 'application/octet-stream'
  const bytes = await response.arrayBuffer()

  return put(blobPath, new Blob([bytes], { type: contentType }), {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  })
}

async function main() {
  const wordpressBaseUrl = env('WORDPRESS_BASE_URL')
  const dryRun = process.argv.includes('--dry-run')
  const copyFiles = process.argv.includes('--copy-files')

  if (copyFiles && !hasUsableBlobToken()) {
    throw new Error('A real BLOB_READ_WRITE_TOKEN is required when using --copy-files.')
  }

  const media = await fetchAllMedia(wordpressBaseUrl)
  const mediaCategory = dryRun
    ? null
    : await prisma.readingMaterialCategory.upsert({
        where: { name: 'WordPress Media Argief' },
        update: {},
        create: {
          name: 'WordPress Media Argief',
          description: 'Opgelaaide WordPress-lêers wat bewaar is tydens migrasie.',
        },
      })

  let copied = 0
  let inventoried = 0
  let exposed = 0
  let failed = 0

  for (const item of media) {
    try {
      const title = titleOf(item)
      const originalFilename = pathnameFromUrl(item.source_url, `${item.id}-${item.slug}`)
      let finalUrl = item.source_url
      let pathname = `wordpress-media/original/${item.id}-${originalFilename}`

      if (copyFiles) {
        const blob = await copyToBlob(item)
        finalUrl = blob.url
        pathname = blob.pathname
        copied++
      }

      if (!dryRun) {
        await prisma.uploadedAsset.upsert({
          where: { id: `wp-media-${item.id}` },
          update: {
            url: finalUrl,
            pathname,
            filename: originalFilename,
            mimeType: item.mime_type,
            size: item.media_details?.filesize || 0,
            purpose: 'wordpress-media-archive',
          },
          create: {
            id: `wp-media-${item.id}`,
            url: finalUrl,
            pathname,
            filename: originalFilename,
            mimeType: item.mime_type,
            size: item.media_details?.filesize || 0,
            purpose: 'wordpress-media-archive',
          },
        })

        if (shouldExposeAsReadingMaterial(item.mime_type)) {
          await prisma.readingMaterial.upsert({
            where: { id: `wp-media-${item.id}` },
            update: {
              title,
              description: `WordPress media argief: ${originalFilename}`,
              fileUrl: finalUrl,
              externalUrl: null,
              categoryId: mediaCategory!.id,
              fileType: fileTypeForMime(item.mime_type),
              fileSize: item.media_details?.filesize || null,
            },
            create: {
              id: `wp-media-${item.id}`,
              title,
              description: `WordPress media argief: ${originalFilename}`,
              fileUrl: finalUrl,
              externalUrl: null,
              categoryId: mediaCategory!.id,
              fileType: fileTypeForMime(item.mime_type),
              fileSize: item.media_details?.filesize || null,
            },
          })
          exposed++
        }
      }

      inventoried++
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

  console.log(
    JSON.stringify(
      {
        totalMedia: media.length,
        inventoried,
        copiedToBlob: copied,
        exposedAsReadingMaterial: exposed,
        failed,
        dryRun,
        copyFiles,
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
