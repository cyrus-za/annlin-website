#!/usr/bin/env tsx

import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { disconnectDatabase, prisma } from '../lib/db'
import { slugify } from '../lib/slug'

type WpRendered = { rendered?: string }

type WpPage = {
  id: number
  slug: string
  link: string
  title: WpRendered
  content: WpRendered
  excerpt?: WpRendered
}

type WpMedia = {
  id: number
  source_url: string
  mime_type: string
  title?: WpRendered
}

type ExtractedAsset = {
  kind: 'image' | 'linked-file'
  url: string
  filename: string
  mimeHint: string
}

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])
const documentExtensions = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'mp3', 'm4a'])

const diakonieServiceGroups = [
  'hospitaalbesoeke',
  'seniors-2',
  'jeugbediening',
  'sosiale-dienste',
  'tradisionele-dienste',
  'versorging-en-barmhartigheid-2',
  'vervoer-2',
  'verwelkoming-en-gasvryheid',
]

const otherServiceGroups = [
  'gebedsgroepe',
  'evangelisasie-blad',
  'tweedehandse-goedere-verkopings',
  'terebinte',
  'susters',
  'sekuriteit',
  'fontein-redaksie',
  'vroue-bedieningsgroep',
]

const serviceGroupSlugs = new Set([...diakonieServiceGroups, ...otherServiceGroups])

const readingSlugs = new Set([
  'leesstof-2',
  'preke-op-skrif',
  'oordenkings-ons-gesels-oor-jesus',
  'kinderwerkkaarte',
  'ek-wil-weet',
])

const newsSlugs = new Set([
  'nuus-2025',
  'nuus-2024',
  'nuus-2023',
  'nuus-2022',
  'nuus-2021',
  'susters-saamtrek-2024',
  'pinksterfeesvieringe-4-5-junie-2022',
  'uitnodiging-diensteblad',
])

const singletonPageSlugs = new Set([
  'homepagenew',
  'oor-annlin-gemeente',
  'jaarprogram',
  'kontakbesonderhede',
  'onlangse-video-uitsendings-van-preke',
])

function env(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value.replace(/\/+$/, '')
}

function decodeEntities(value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&#038;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#8220;', '"')
    .replaceAll('&#8221;', '"')
    .replaceAll('&#8216;', "'")
    .replaceAll('&#8217;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&nbsp;', ' ')
}

function htmlToText(html = '') {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

function titleOf(page: WpPage) {
  return htmlToText(page.title.rendered || page.slug)
}

function filenameFromUrl(url: string) {
  try {
    const parsed = new URL(decodeEntities(url))
    return decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '')
  } catch {
    return decodeEntities(url).split('/').filter(Boolean).pop() || ''
  }
}

function extensionFromFilename(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function normalizeUrl(url: string) {
  return decodeEntities(url).replace(/^http:\/\//i, 'https://').trim()
}

function assetFromUrl(url: string): ExtractedAsset | null {
  const normalizedUrl = normalizeUrl(url)
  const filename = filenameFromUrl(normalizedUrl)
  const extension = extensionFromFilename(filename)

  if (!documentExtensions.has(extension) && !imageExtensions.has(extension)) {
    return null
  }

  return {
    kind: imageExtensions.has(extension) ? 'image' : 'linked-file',
    url: normalizedUrl,
    filename,
    mimeHint: extension,
  }
}

function uniqueAssets(assets: ExtractedAsset[]) {
  const byUrl = new Map<string, ExtractedAsset>()

  for (const asset of assets) {
    byUrl.set(normalizeUrl(asset.url), {
      ...asset,
      url: normalizeUrl(asset.url),
    })
  }

  return [...byUrl.values()]
}

function extractAssets(html = '') {
  const assets: ExtractedAsset[] = []
  const decodedHtml = decodeEntities(html)

  for (const match of decodedHtml.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const asset = assetFromUrl(match[1] ?? '')
    if (asset) assets.push(asset)
  }

  for (const match of decodedHtml.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const asset = assetFromUrl(match[1] ?? '')
    if (asset) assets.push(asset)
  }

  for (const match of decodedHtml.matchAll(/\[et_pb_image\b[^\]]*]/gi)) {
    const shortcode = match[0]
    const src = shortcode.match(/\bsrc=["']([^"']+)["']/i)?.[1]
    const href = shortcode.match(/\burl=["']([^"']+)["']/i)?.[1]

    for (const url of [src, href]) {
      if (!url) continue
      const asset = assetFromUrl(url)
      if (asset) assets.push(asset)
    }
  }

  return uniqueAssets(assets)
}

function collectPublicAssetFilenames(root: string) {
  const filenames = new Set<string>()

  function visit(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(entryPath)
      } else {
        filenames.add(entry.name.toLowerCase())
      }
    }
  }

  if (existsSync(root)) {
    visit(root)
  }

  return filenames
}

function pageTypeForSlug(slug: string) {
  if (serviceGroupSlugs.has(slug)) return 'serviceGroup'
  if (readingSlugs.has(slug)) return 'readingMaterial'
  if (newsSlugs.has(slug)) return 'newsArticle'
  if (singletonPageSlugs.has(slug)) return 'singleton'
  return 'archiveReadingMaterial'
}

async function fetchJson<T>(url: string): Promise<{ data: T; totalPages: number; total: number }> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Annlin WordPress inline asset audit',
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

async function fetchAllPages(wordpressBaseUrl: string) {
  const fields = 'id,slug,link,title,content,excerpt'
  const first = await fetchJson<WpPage[]>(
    `${wordpressBaseUrl}/wp-json/wp/v2/pages?per_page=100&page=1&_fields=${fields}`
  )

  const pages = [...first.data]

  for (let page = 2; page <= first.totalPages; page++) {
    const next = await fetchJson<WpPage[]>(
      `${wordpressBaseUrl}/wp-json/wp/v2/pages?per_page=100&page=${page}&_fields=${fields}`
    )
    pages.push(...next.data)
  }

  return pages
}

async function fetchAllMedia(wordpressBaseUrl: string) {
  const fields = 'id,source_url,mime_type,title'
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

function assetIsReferencedInText(asset: ExtractedAsset, content: string) {
  const normalizedContent = content.toLowerCase()
  return (
    normalizedContent.includes(asset.url.toLowerCase()) ||
    (asset.filename.length > 0 && normalizedContent.includes(asset.filename.toLowerCase()))
  )
}

async function main() {
  const wordpressBaseUrl = env('WORDPRESS_BASE_URL')

  const pages = await fetchAllPages(wordpressBaseUrl)
  const media = await fetchAllMedia(wordpressBaseUrl)
  const [serviceGroups, articles, readingMaterials, uploadedAssets] = await Promise.all([
    prisma.serviceGroup.findMany(),
    prisma.article.findMany(),
    prisma.readingMaterial.findMany(),
    prisma.uploadedAsset.findMany({ where: { id: { startsWith: 'wp-media-' } } }),
  ])

  const serviceGroupBySlug = new Map(serviceGroups.map((item) => [item.slug, item]))
  const articleBySlug = new Map(articles.map((item) => [item.slug, item]))
  const readingById = new Map(readingMaterials.map((item) => [item.id, item]))
  const uploadedAssetFilenames = new Set(uploadedAssets.map((item) => item.filename.toLowerCase()))
  const publicAssetFilenames = collectPublicAssetFilenames(join(process.cwd(), 'public', 'migrated'))

  const mediaByUrl = new Map(media.map((item) => [normalizeUrl(item.source_url), item]))

  const pageAudits = pages
    .map((page) => {
      const pageType = pageTypeForSlug(page.slug)
      const assets = extractAssets(page.content.rendered || '')

      let migratedContent = ''
      if (pageType === 'serviceGroup') {
        const group = serviceGroupBySlug.get(slugify(page.slug))
        migratedContent = [group?.description, group?.thumbnailUrl, group?.bannerUrl]
          .filter(Boolean)
          .join('\n')
      } else if (pageType === 'newsArticle') {
        const article = articleBySlug.get(slugify(page.slug))
        migratedContent = [article?.content, article?.excerpt, article?.featuredImageUrl]
          .filter(Boolean)
          .join('\n')
      } else if (pageType === 'readingMaterial') {
        const material = readingById.get(`wp-page-${page.id}`)
        migratedContent = [material?.description, material?.fileUrl, material?.externalUrl]
          .filter(Boolean)
          .join('\n')
      } else if (pageType === 'archiveReadingMaterial') {
        const material = readingById.get(`wp-archive-page-${page.id}`)
        migratedContent = [material?.description, material?.fileUrl, material?.externalUrl]
          .filter(Boolean)
          .join('\n')
      }

      const missingFromMigratedContent = assets.filter(
        (asset) => !assetIsReferencedInText(asset, migratedContent)
      )
      const missingFromAssetArchive = assets.filter((asset) => {
        const filename = asset.filename.toLowerCase()
        return !uploadedAssetFilenames.has(filename) && !publicAssetFilenames.has(filename)
      })

      return {
        slug: page.slug,
        title: titleOf(page),
        pageType,
        wpUrl: page.link,
        inlineImages: assets.filter((asset) => asset.kind === 'image').length,
        linkedFiles: assets.filter((asset) => asset.kind === 'linked-file').length,
        missingFromMigratedContent,
        missingFromAssetArchive,
      }
    })
    .filter(
      (audit) =>
        audit.inlineImages > 0 ||
        audit.linkedFiles > 0 ||
        audit.missingFromMigratedContent.length > 0 ||
        audit.missingFromAssetArchive.length > 0
    )

  const assetsReferencedByPages = new Set(
    pageAudits.flatMap((audit) =>
      [...audit.missingFromMigratedContent, ...audit.missingFromAssetArchive].map((asset) =>
        normalizeUrl(asset.url)
      )
    )
  )

  console.log(
    JSON.stringify(
      {
        summary: {
          wordpressPages: pages.length,
          wordpressMedia: media.length,
          pagesWithAssets: pageAudits.length,
          pagesWithMissingRenderedAssets: pageAudits.filter(
            (audit) => audit.missingFromMigratedContent.length > 0
          ).length,
          missingRenderedAssetReferences: pageAudits.reduce(
            (total, audit) => total + audit.missingFromMigratedContent.length,
            0
          ),
          pagesWithAssetsMissingFromArchive: pageAudits.filter(
            (audit) => audit.missingFromAssetArchive.length > 0
          ).length,
          missingArchivedAssetReferences: pageAudits.reduce(
            (total, audit) => total + audit.missingFromAssetArchive.length,
            0
          ),
          missingAssetUrlsMatchedInWpMedia: [...assetsReferencedByPages].filter((url) =>
            mediaByUrl.has(url)
          ).length,
        },
        pages: pageAudits,
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
