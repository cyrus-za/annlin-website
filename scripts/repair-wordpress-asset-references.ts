#!/usr/bin/env tsx

import { disconnectDatabase, prisma } from '../lib/db'
import { slugify } from '../lib/slug'
import {
  decodeWordPressEntities,
  extractWordPressGalleryMediaIds,
  extractWordPressAssetReferences,
  type WordPressAssetReference,
} from '../lib/wordpress-assets'
import { migratedPublicAssetUrlForWordPressUrl } from '../lib/wordpress-migration'

type WpRendered = { rendered?: string }

type WpPage = {
  id: number
  slug: string
  content: WpRendered
}

type WpMedia = {
  id: number
  source_url: string
  alt_text?: string
  title?: WpRendered
}

const serviceGroupSlugs = new Set([
  'hospitaalbesoeke',
  'seniors-2',
  'jeugbediening',
  'sosiale-dienste',
  'tradisionele-dienste',
  'versorging-en-barmhartigheid-2',
  'vervoer-2',
  'verwelkoming-en-gasvryheid',
  'gebedsgroepe',
  'evangelisasie-blad',
  'tweedehandse-goedere-verkopings',
  'terebinte',
  'susters',
  'sekuriteit',
  'fontein-redaksie',
  'vroue-bedieningsgroep',
])

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

function wordpressBaseUrl() {
  const value = process.env['WORDPRESS_BASE_URL']
  if (!value) throw new Error('WORDPRESS_BASE_URL is required.')
  return value.replace(/\/+$/, '')
}

function filenameFromUrl(value: string) {
  try {
    return decodeURIComponent(
      new URL(value, 'https://local.invalid').pathname.split('/').pop() || ''
    )
  } catch {
    return value.split('/').pop() || ''
  }
}

function humanizeFilename(value: string) {
  return value
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function referenceUrl(reference: WordPressAssetReference) {
  const value =
    migratedPublicAssetUrlForWordPressUrl(reference.url) || reference.url.replace(/^http:/i, 'https:')

  return value.replace(/(?<=\d)×(?=\d)/g, 'x')
}

function contentContainsReference(content: string, reference: WordPressAssetReference) {
  const url = referenceUrl(reference).toLowerCase()

  if (reference.kind === 'image') {
    return [...content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].some(
      (match) => match[1]?.trim().toLowerCase() === url
    )
  }

  return content.toLowerCase().includes(url)
}

function referenceToMarkdown(reference: WordPressAssetReference) {
  const url = referenceUrl(reference)
  const label = reference.label || humanizeFilename(filenameFromUrl(url))

  return reference.kind === 'image'
    ? `![${label}](${url})`
    : `[${label || 'Maak lêer oop'}](${url})`
}

function appendMissingReferences(content: string, references: WordPressAssetReference[]) {
  let normalizedContent = content
  const rewritten: Array<{ from: string; to: string }> = []

  for (const reference of references) {
    const canonicalUrl = referenceUrl(reference)
    const sourceUrls = [reference.url, reference.url.replace(/^http:/i, 'https:')]

    for (const sourceUrl of sourceUrls) {
      if (sourceUrl === canonicalUrl || !normalizedContent.includes(sourceUrl)) continue
      normalizedContent = normalizedContent.replaceAll(sourceUrl, canonicalUrl)
      rewritten.push({ from: sourceUrl, to: canonicalUrl })
    }
  }

  const missing = references.filter(
    (reference) => !contentContainsReference(normalizedContent, reference)
  )
  const uniqueMissing = [
    ...new Map(
      missing.map((reference) => [
        `${reference.kind}:${referenceUrl(reference).toLowerCase()}`,
        reference,
      ])
    ).values(),
  ]

  if (uniqueMissing.length === 0) {
    return {
      content: normalizedContent,
      added: [] as WordPressAssetReference[],
      rewritten,
    }
  }

  return {
    content: [normalizedContent.trimEnd(), ...uniqueMissing.map(referenceToMarkdown)]
      .filter(Boolean)
      .join('\n\n'),
    added: uniqueMissing,
    rewritten,
  }
}

async function fetchPages() {
  const response = await fetch(
    `${wordpressBaseUrl()}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,content`,
    {
      headers: {
        accept: 'application/json',
        'user-agent': 'Annlin WordPress asset-reference repair',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`WordPress page fetch failed with ${response.status}.`)
  }

  return response.json() as Promise<WpPage[]>
}

async function fetchGalleryMedia(pages: WpPage[]) {
  const mediaIds = [
    ...new Set(pages.flatMap((page) => extractWordPressGalleryMediaIds(page.content.rendered || ''))),
  ]
  const media: WpMedia[] = []

  for (let index = 0; index < mediaIds.length; index += 50) {
    const ids = mediaIds.slice(index, index + 50)
    const response = await fetch(
      `${wordpressBaseUrl()}/wp-json/wp/v2/media?per_page=50&include=${ids.join(',')}&_fields=id,source_url,alt_text,title`,
      {
        headers: {
          accept: 'application/json',
          'user-agent': 'Annlin WordPress asset-reference repair',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`WordPress gallery media fetch failed with ${response.status}.`)
    }

    media.push(...((await response.json()) as WpMedia[]))
  }

  return new Map(media.map((item) => [item.id, item]))
}

function referencesForPage(page: WpPage, mediaById: ReadonlyMap<number, WpMedia>) {
  const html = page.content.rendered || ''
  const references = extractWordPressAssetReferences(html)

  for (const [index, mediaId] of extractWordPressGalleryMediaIds(html).entries()) {
    const media = mediaById.get(mediaId)
    if (!media?.source_url) continue

    references.push({
      kind: 'image',
      url: media.source_url,
      label: decodeWordPressEntities(media.alt_text || media.title?.rendered || ''),
      filename: filenameFromUrl(media.source_url),
      sourceIndex: Number.MAX_SAFE_INTEGER - index,
    })
  }

  return [
    ...new Map(
      references.map((reference) => [`${reference.kind}:${referenceUrl(reference)}`, reference])
    ).values(),
  ]
}

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run')

  if (apply === dryRun) {
    throw new Error('Choose exactly one mode: --dry-run or --apply.')
  }

  const pages = await fetchPages()
  const mediaById = await fetchGalleryMedia(pages)
  const [serviceGroups, articles, readingMaterials] = await Promise.all([
    prisma.serviceGroup.findMany({ select: { id: true, slug: true, description: true } }),
    prisma.article.findMany({ select: { id: true, slug: true, content: true } }),
    prisma.readingMaterial.findMany({ select: { id: true, description: true } }),
  ])

  const serviceGroupBySlug = new Map(serviceGroups.map((item) => [item.slug, item]))
  const articleBySlug = new Map(articles.map((item) => [item.slug, item]))
  const readingById = new Map(readingMaterials.map((item) => [item.id, item]))
  const changes: Array<{
    type: 'serviceGroup' | 'article' | 'readingMaterial'
    id: string
    slug: string
    before: string
    after: string
    sourceAssets: number
    addedReferences: WordPressAssetReference[]
    rewrittenReferences: Array<{ from: string; to: string }>
  }> = []

  for (const page of pages) {
    if (singletonPageSlugs.has(page.slug)) continue

    const html = page.content.rendered || ''
    const references = referencesForPage(page, mediaById)
    const sourceAssets = references.length
    if (sourceAssets === 0) continue

    let target:
      | { type: 'serviceGroup' | 'article' | 'readingMaterial'; id: string; content: string }
      | null = null

    if (serviceGroupSlugs.has(page.slug)) {
      const group = serviceGroupBySlug.get(slugify(page.slug))
      if (group) target = { type: 'serviceGroup', id: group.id, content: group.description }
    } else if (newsSlugs.has(page.slug)) {
      const article = articleBySlug.get(slugify(page.slug))
      if (article) target = { type: 'article', id: article.id, content: article.content }
    } else {
      const prefix = readingSlugs.has(page.slug) ? 'wp-page' : 'wp-archive-page'
      const material = readingById.get(`${prefix}-${page.id}`)
      if (material) {
        target = { type: 'readingMaterial', id: material.id, content: material.description || '' }
      }
    }

    if (!target) continue

    const repaired = appendMissingReferences(target.content, references)
    const after = repaired.content

    if (after !== target.content) {
      changes.push({
        type: target.type,
        id: target.id,
        slug: page.slug,
        before: target.content,
        after,
        sourceAssets,
        addedReferences: repaired.added,
        rewrittenReferences: repaired.rewritten,
      })
    }
  }

  if (apply) {
    await prisma.$transaction(
      changes.map((change) => {
        if (change.type === 'serviceGroup') {
          return prisma.serviceGroup.update({
            where: { id: change.id },
            data: { description: change.after },
          })
        }

        if (change.type === 'article') {
          return prisma.article.update({
            where: { id: change.id },
            data: { content: change.after },
          })
        }

        return prisma.readingMaterial.update({
          where: { id: change.id },
          data: { description: change.after },
        })
      })
    )
  }

  console.log(
    JSON.stringify(
      {
        apply,
        changedRecords: changes.length,
        addedCharacters: changes.reduce(
          (total, change) => total + change.after.length - change.before.length,
          0
        ),
        records: changes.map((change) => ({
          type: change.type,
          slug: change.slug,
          sourceAssets: change.sourceAssets,
          beforeLength: change.before.length,
          afterLength: change.after.length,
          addedReferences: change.addedReferences.map((reference) => ({
            kind: reference.kind,
            url: referenceUrl(reference),
          })),
          rewrittenReferences: change.rewrittenReferences,
        })),
        diagnostics: pages
          .filter((page) =>
            ['jeugbediening', 'nuus-2023', 'susters-saamtrek-2024'].includes(page.slug)
          )
          .map((page) => ({
            slug: page.slug,
            htmlLength: page.content.rendered?.length || 0,
            extractedReferences: referencesForPage(page, mediaById).length,
          })),
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
