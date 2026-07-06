#!/usr/bin/env tsx

import { prisma, disconnectDatabase } from '../lib/db'
import { slugify } from '../lib/slug'

type WpRendered = { rendered?: string }

type WpPage = {
  id: number
  slug: string
  link: string
  title: WpRendered
  content: WpRendered
  excerpt?: WpRendered
  modified?: string
  date?: string
}

type TribeEvent = {
  id: number
  slug: string
  title: string
  description?: string
  excerpt?: string
  url: string
  start_date: string
  end_date?: string
}

type WpMedia = {
  id: number
  source_url: string
  mime_type: string
  media_details?: {
    filesize?: number
  }
}

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

const expectedPublicRoutes = [
  '/',
  '/oor-annlin-gemeente',
  '/jaarprogram',
  '/uitsendings',
  '/nuus',
  '/diensgroepe',
  '/leesstof',
  '/kontakbesonderhede',
  '/privaatheid',
  '/gebruiksvoorwaardes',
]

function env(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value.replace(/\/+$/, '')
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
      .replaceAll('&hellip;', '...')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
  }

  return decoded
}

function htmlToText(html = '') {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/\[\/?et_pb_[^\]]*]/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim()
  )
}

function normalizedWords(value: string) {
  return new Set(
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= 5)
  )
}

function coverage(source: string, target: string) {
  const sourceWords = normalizedWords(source)
  const targetWords = normalizedWords(target)
  if (sourceWords.size === 0) return 1

  let hits = 0
  for (const word of sourceWords) {
    if (targetWords.has(word)) hits++
  }

  return hits / sourceWords.size
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Annlin migration audit',
    },
  })

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status}: ${url}`)
  }

  return response.json() as Promise<T>
}

async function fetchJsonWithHeaders<T>(
  url: string
): Promise<{ data: T; totalPages: number; total: number }> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Annlin migration audit',
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
  const fields = 'id,source_url,mime_type,media_details'
  const first = await fetchJsonWithHeaders<WpMedia[]>(
    `${wordpressBaseUrl}/wp-json/wp/v2/media?per_page=100&page=1&_fields=${fields}`
  )
  const media = [...first.data]

  for (let page = 2; page <= first.totalPages; page++) {
    const next = await fetchJsonWithHeaders<WpMedia[]>(
      `${wordpressBaseUrl}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=${fields}`
    )
    media.push(...next.data)
  }

  return {
    media,
    total: first.total || media.length,
  }
}

async function routeStatus(baseUrl: string, path: string) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      redirect: 'manual',
      headers: { 'user-agent': 'Annlin migration audit' },
    })

    return {
      path,
      status: response.status,
      location: response.headers.get('location'),
      error: null,
    }
  } catch (error) {
    return {
      path,
      status: 0,
      location: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function routeStatuses(baseUrl: string, paths: string[]) {
  const results: Awaited<ReturnType<typeof routeStatus>>[] = []

  for (const path of paths) {
    results.push(await routeStatus(baseUrl, path))
  }

  return results
}

function normalizeLocation(location: string | null) {
  if (!location) return null

  try {
    return new URL(location).pathname
  } catch {
    return location
  }
}

async function main() {
  const wordpressBaseUrl = env('WORDPRESS_BASE_URL')
  const appBaseUrl = env('NEXT_PUBLIC_APP_URL')

  const pages = await fetchJson<WpPage[]>(
    `${wordpressBaseUrl}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,link,title,content,excerpt,modified,date`
  )
  const eventResponse = await fetchJson<{ events?: TribeEvent[] }>(
    `${wordpressBaseUrl}/wp-json/tribe/events/v1/events?per_page=100`
  )
  const mediaResponse = await fetchAllMedia(wordpressBaseUrl)

  const [serviceGroups, articles, readingMaterials, events, uploadedAssets] = await Promise.all([
    prisma.serviceGroup.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
    prisma.article.findMany({ where: { status: 'PUBLISHED' } }),
    prisma.readingMaterial.findMany(),
    prisma.event.findMany(),
    prisma.uploadedAsset.findMany({ where: { id: { startsWith: 'wp-media-' } } }),
  ])

  const serviceGroupBySlug = new Map(serviceGroups.map((group) => [group.slug, group]))
  const articleBySlug = new Map(articles.map((article) => [article.slug, article]))
  const readingById = new Map(readingMaterials.map((item) => [item.id, item]))
  const eventById = new Map(events.map((event) => [event.id, event]))
  const uploadedAssetById = new Map(uploadedAssets.map((asset) => [asset.id, asset]))

  const serviceGroupAudit = pages
    .filter((page) => serviceGroupSlugs.has(page.slug))
    .map((page) => {
      const source = htmlToText(page.content.rendered || page.excerpt?.rendered || '')
      const target = serviceGroupBySlug.get(slugify(page.slug))?.description || ''
      return {
        slug: page.slug,
        title: htmlToText(page.title.rendered || page.slug),
        sourceChars: source.length,
        targetChars: target.length,
        coverage: Number(coverage(source, target).toFixed(3)),
        present: Boolean(target),
      }
    })

  const readingAudit = pages
    .filter((page) => readingSlugs.has(page.slug))
    .map((page) => {
      const source = htmlToText(page.content.rendered || page.excerpt?.rendered || '')
      const target = readingById.get(`wp-page-${page.id}`)?.description || ''
      return {
        slug: page.slug,
        title: htmlToText(page.title.rendered || page.slug),
        sourceChars: source.length,
        targetChars: target.length,
        coverage: Number(coverage(source, target).toFixed(3)),
        present: Boolean(target),
      }
    })

  const archiveAudit = pages
    .filter(
      (page) =>
        !serviceGroupSlugs.has(page.slug) &&
        !readingSlugs.has(page.slug) &&
        !newsSlugs.has(page.slug) &&
        !singletonPageSlugs.has(page.slug)
    )
    .map((page) => {
      const source = htmlToText(page.content.rendered || page.excerpt?.rendered || '')
      const target = readingById.get(`wp-archive-page-${page.id}`)?.description || ''
      return {
        slug: page.slug,
        title: htmlToText(page.title.rendered || page.slug),
        sourceChars: source.length,
        targetChars: target.length,
        coverage: Number(coverage(source, target).toFixed(3)),
        present: Boolean(target),
      }
    })

  const newsAudit = pages
    .filter((page) => newsSlugs.has(page.slug))
    .map((page) => {
      const source = htmlToText(page.content.rendered || page.excerpt?.rendered || '')
      const target = articleBySlug.get(slugify(page.slug))?.content || ''
      return {
        slug: page.slug,
        title: htmlToText(page.title.rendered || page.slug),
        sourceChars: source.length,
        targetChars: target.length,
        coverage: Number(coverage(source, target).toFixed(3)),
        present: Boolean(target),
      }
    })

  const eventAudit = (eventResponse.events || []).map((event) => {
    const target = eventById.get(`wp-event-${event.id}`)
    return {
      id: event.id,
      slug: event.slug,
      title: htmlToText(event.title),
      present: Boolean(target),
      startDateMatches: target
        ? new Date(event.start_date).toISOString() === target.startDate.toISOString()
        : false,
    }
  })

  const mediaAudit = mediaResponse.media.map((media) => {
    const asset = uploadedAssetById.get(`wp-media-${media.id}`)
    const fileUrl = asset?.url || ''
    return {
      id: media.id,
      mimeType: media.mime_type,
      sourceUrl: media.source_url,
      sourceSize: media.media_details?.filesize || null,
      present: Boolean(asset),
      copiedOffWordPress: Boolean(asset && !/annlin\.co\.za\/wp-content/i.test(fileUrl)),
    }
  })

  const oldDomainPattern = /https?:\/\/(?:www\.)?annlin\.co\.za|www\.annlin\.co\.za|annlin\.co\.za\/wp-content/i
  const oldDomainRows = [
    ...serviceGroups
      .filter((group) =>
        oldDomainPattern.test(
          [group.description, group.thumbnailUrl, group.bannerUrl].filter(Boolean).join('\n')
        )
      )
      .map((group) => ({ type: 'serviceGroup', slug: group.slug })),
    ...articles
      .filter((article) =>
        oldDomainPattern.test(
          [article.content, article.excerpt, article.featuredImageUrl].filter(Boolean).join('\n')
        )
      )
      .map((article) => ({ type: 'article', slug: article.slug })),
    ...readingMaterials
      .filter((item) =>
        oldDomainPattern.test(
          [item.description, item.fileUrl, item.externalUrl].filter(Boolean).join('\n')
        )
      )
      .map((item) => ({ type: 'readingMaterial', title: item.title })),
  ]

  const routeAudit = await routeStatuses(appBaseUrl, expectedPublicRoutes)
  const archiveSlugs = archiveAudit.map((item) => item.slug)
  const expectedRedirects = [
    ...[...serviceGroupSlugs].map((slug) => ({ path: `/${slug}`, destination: '/diensgroepe' })),
    ...[...readingSlugs].map((slug) => ({ path: `/${slug}`, destination: '/leesstof' })),
    ...[...newsSlugs].map((slug) => ({ path: `/${slug}`, destination: '/nuus' })),
    ...archiveSlugs.map((slug) => ({ path: `/${slug}`, destination: '/leesstof' })),
  ]
  const redirectAudit = await routeStatuses(
    appBaseUrl,
    expectedRedirects.map((redirect) => redirect.path)
  )
  const redirectDestinations = new Map(
    expectedRedirects.map((redirect) => [redirect.path, redirect.destination])
  )

  const lowCoverage = [...serviceGroupAudit, ...readingAudit, ...newsAudit, ...archiveAudit].filter(
    (item) => !item.present || item.coverage < 0.92
  )
  const missingEvents = eventAudit.filter((item) => !item.present || !item.startDateMatches)
  const missingMedia = mediaAudit.filter((item) => !item.present)
  const mediaStillOnWordPress = mediaAudit.filter((item) => item.present && !item.copiedOffWordPress)
  const badRoutes = routeAudit.filter((route) => route.status === 0 || route.status >= 400)
  const badRedirects = redirectAudit.filter((route) => {
    if (![307, 308].includes(route.status)) return true
    return normalizeLocation(route.location) !== redirectDestinations.get(route.path)
  })

  console.log(
    JSON.stringify(
      {
        summary: {
          wordpressPages: pages.length,
          expectedServiceGroups: serviceGroupSlugs.size,
          migratedServiceGroups: serviceGroups.length,
          expectedReadingMaterials: readingSlugs.size,
          migratedReadingMaterials: readingMaterials.length,
          archivedWordPressPages: archiveAudit.length,
          expectedNewsArticles: newsSlugs.size,
          migratedNewsArticles: articles.length,
          wordpressEvents: eventResponse.events?.length || 0,
          migratedEvents: events.length,
          wordpressMedia: mediaResponse.total,
          migratedMediaAssets: uploadedAssets.length,
          mediaStillOnWordPress: mediaStillOnWordPress.length,
          wordpressMediaKnownBytes: mediaResponse.media.reduce(
            (total, item) => total + (item.media_details?.filesize || 0),
            0
          ),
          wordpressMediaUnknownSizes: mediaResponse.media.filter((item) => !item.media_details?.filesize)
            .length,
          lowCoverage: lowCoverage.length,
          missingEvents: missingEvents.length,
          missingMedia: missingMedia.length,
          oldDomainRows: oldDomainRows.length,
          badRoutes: badRoutes.length,
          badRedirects: badRedirects.length,
          wordpressOfflineReady:
            lowCoverage.length === 0 &&
            missingEvents.length === 0 &&
            missingMedia.length === 0 &&
            mediaStillOnWordPress.length === 0 &&
            oldDomainRows.length === 0 &&
            badRoutes.length === 0 &&
            badRedirects.length === 0,
        },
        lowCoverage,
        missingEvents,
        missingMediaSample: missingMedia.slice(0, 25),
        mediaStillOnWordPressSample: mediaStillOnWordPress.slice(0, 25),
        oldDomainRows,
        badRoutes,
        badRedirects,
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
