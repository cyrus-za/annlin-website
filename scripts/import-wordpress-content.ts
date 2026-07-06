#!/usr/bin/env tsx

import { ArticleStatus, ReadingMaterialFileType, ServiceGroupCategory } from '@prisma/client'
import { disconnectDatabase, prisma } from '../lib/db'
import { slugify } from '../lib/slug'

const DEFAULT_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'admin@localhost.local'
const DEFAULT_CONTACT_PERSON = 'Kerkkantoor'

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
  venue?: {
    venue?: string
    address?: string
    city?: string
    country?: string
  }
}

const placeholderServiceGroupSlugs = [
  'diakonie',
  'barmhartigheid',
  'jeug',
  'susters',
  'musiekbediening',
]

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

const serviceGroupDisplayOrder = new Map(
  [...diakonieServiceGroups, ...otherServiceGroups].map((slug, index) => [slug, index + 1])
)

const serviceGroupThumbnailUrls = new Map<string, string>([
  ['hospitaalbesoeke', '/migrated/diensgroepe/siekebesoeke.png'],
  ['seniors-2', '/migrated/diensgroepe/seniors.png'],
  ['jeugbediening', '/migrated/diensgroepe/jeug.png'],
  ['sosiale-dienste', '/migrated/diensgroepe/sosiale-dienste.png'],
  ['tradisionele-dienste', '/migrated/diensgroepe/tradisionele-dienste.png'],
  [
    'versorging-en-barmhartigheid-2',
    '/migrated/diensgroepe/versorging-en-barmhartigheid.png',
  ],
  ['vervoer-2', '/migrated/diensgroepe/vervoer.png'],
  ['verwelkoming-en-gasvryheid', '/migrated/diensgroepe/verwelkoming-en-gasvryheid.png'],
  ['gebedsgroepe', '/migrated/diensgroepe/gebedsgroep.png'],
  ['evangelisasie-blad', '/migrated/diensgroepe/evangelisasie.png'],
  ['tweedehandse-goedere-verkopings', '/migrated/diensgroepe/tweedehandse-goedere.png'],
  ['terebinte', '/migrated/diensgroepe/terebinte.jpg'],
  ['susters', '/migrated/diensgroepe/susters.png'],
  ['sekuriteit', '/migrated/diensgroepe/sekuriteit.png'],
  ['fontein-redaksie', '/migrated/diensgroepe/fontein-redaksie.png'],
  ['vroue-bedieningsgroep', '/migrated/diensgroepe/vroue-bedieningsgroep.png'],
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

const archiveSlugs = new Set([
  'mosambiek-whatsappgroep',
  'manne-bedieningsgroep-4',
  'koor',
  'verwelkoming',
  'katkisasie-leerkragte',
  'rousmart',
  'kleuterbediening',
  'verslawing2',
  'laerskooljeug',
  'katkisasie-fotoblad',
  'buitelandse-evangelisasie',
  'bybelverspreiding',
  'evangelisasie-omliggende-gebiede',
  'evangelisasie-eie-omgewing',
])

const singletonPageSlugs = new Set([
  'homepagenew',
  'oor-annlin-gemeente',
  'jaarprogram',
  'kontakbesonderhede',
  'onlangse-video-uitsendings-van-preke',
])

const KERKDIENSTGEMIST_STATION_URL =
  'https://kerkdienstgemist.nl/stations/1246-Gereformeerde-Kerk-Pretoria-Annlin'

const KERKDIENSTGEMIST_STATION_PATTERN =
  /\bhttps?:\/\/kerkdienstgemist\.nl\/stations\/1246-Gereformeerde-Kerk-Pretoria-Annlin\/?/gi
const KERKDIENSTGEMIST_STATION_TEST_PATTERN =
  /\bhttps?:\/\/kerkdienstgemist\.nl\/stations\/1246-Gereformeerde-Kerk-Pretoria-Annlin\/?/i

function replacementRouteForLegacySlug(slug: string) {
  if (serviceGroupSlugs.has(slug)) return '/diensgroepe'
  if (readingSlugs.has(slug)) return '/leesstof'
  if (archiveSlugs.has(slug)) return '/leesstof'
  if (newsSlugs.has(slug)) return '/nuus'
  if (slug === 'onlangse-video-uitsendings-van-preke') return '/uitsendings'
  if (slug === 'homepagenew' || slug === '') return '/'
  return null
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function legacySiteHostPattern() {
  const baseUrl = process.env.WORDPRESS_BASE_URL
  if (!baseUrl) return null

  try {
    return escapeRegExp(new URL(baseUrl).host.replace(/^www\./, ''))
  } catch {
    return null
  }
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
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
  }

  return decoded
}

function replaceLegacySiteReferences(value: string) {
  const hostPattern = legacySiteHostPattern()
  if (!hostPattern) return value

  const uploadUrlPattern = new RegExp(
    `\\bhttps?:\\/\\/(?:www\\.)?${hostPattern}\\/wp-content\\/uploads\\/[^\\s"')\\]]+`,
    'gi'
  )
  const pageUrlPattern = new RegExp(
    `\\bhttps?:\\/\\/(?:www\\.)?${hostPattern}\\/([a-z0-9-]+)\\/?`,
    'gi'
  )
  const barePageUrlPattern = new RegExp(
    `\\bwww\\.${hostPattern}\\/([a-z0-9-]+)\\/?`,
    'gi'
  )

  return value
    .replace(uploadUrlPattern, '')
    .replace(pageUrlPattern, (match, slug: string) => replacementRouteForLegacySlug(slug) ?? match)
    .replace(barePageUrlPattern, (match, slug: string) => {
      const route = replacementRouteForLegacySlug(slug)
      return route ?? match
    })
}

function hasKerkdienstgemistStationLink(value: string) {
  return KERKDIENSTGEMIST_STATION_TEST_PATTERN.test(value)
}

function normalizeEventDescription(value: string) {
  return value
    .replace(
      /(?:\s*Vir die klankuitsending,?\s*klik op die volgende skakel:\s*)?\bhttps?:\/\/kerkdienstgemist\.nl\/stations\/1246-Gereformeerde-Kerk-Pretoria-Annlin\/?/gi,
      ''
    )
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim()
}

function getWordPressBaseUrl() {
  const baseUrl = process.env.WORDPRESS_BASE_URL

  if (!baseUrl) {
    throw new Error('WORDPRESS_BASE_URL is required to import legacy WordPress content.')
  }

  return baseUrl.replace(/\/+$/, '')
}

function htmlToText(html = '') {
  const text = decodeEntities(
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

  return replaceLegacySiteReferences(text).replace(/[ \t]{2,}/g, ' ').trim()
}

function titleOf(page: WpPage) {
  return htmlToText(page.title.rendered || page.slug)
}

function contentOf(page: WpPage) {
  const content = htmlToText(page.content.rendered || '')
  const excerpt = htmlToText(page.excerpt?.rendered || '')
  return content || excerpt || titleOf(page)
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trim()}…`
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Annlin WordPress migration importer',
    },
  })

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status}: ${url}`)
  }

  return response.json() as Promise<T>
}

function categoryForServiceGroup(page: WpPage): ServiceGroupCategory {
  if (diakonieServiceGroups.includes(page.slug)) {
    return ServiceGroupCategory.DIAKONIE
  }

  return ServiceGroupCategory.OTHER
}

function titleForServiceGroup(page: WpPage) {
  if (page.slug === 'hospitaalbesoeke') return 'Siekebesoeke'
  if (page.slug === 'evangelisasie-blad') return 'Evangelisasie'
  if (page.slug === 'tweedehandse-goedere-verkopings') return 'Tweedehandse Goedere Verkoping'
  return titleOf(page)
}

function locationForEvent(event: TribeEvent) {
  const parts = [
    event.venue?.venue,
    event.venue?.address,
    event.venue?.city,
    event.venue?.country,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : undefined
}

async function main() {
  console.log('Fetching WordPress content...')
  const wordpressBaseUrl = getWordPressBaseUrl()

  const pages = await fetchJson<WpPage[]>(
    `${wordpressBaseUrl}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,link,title,content,excerpt,modified,date`
  )
  const eventResponse = await fetchJson<{ events?: TribeEvent[] }>(
    `${wordpressBaseUrl}/wp-json/tribe/events/v1/events?per_page=100`
  )

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
  })

  if (!admin) {
    throw new Error('No admin user found. Seed the admin user before importing WordPress content.')
  }

  const articleCategory = await prisma.articleCategory.upsert({
    where: { slug: 'algemeen' },
    update: {},
    create: {
      name: 'Algemeen',
      slug: 'algemeen',
      description: 'Algemene gemeente nuus',
      color: '#A16207',
    },
  })

  const readingCategory = await prisma.readingMaterialCategory.upsert({
    where: { name: 'Algemeen' },
    update: {},
    create: {
      name: 'Algemeen',
      description: 'Algemene leesstof en toerusting',
    },
  })

  const archiveCategory = await prisma.readingMaterialCategory.upsert({
    where: { name: 'Argief uit WordPress' },
    update: {},
    create: {
      name: 'Argief uit WordPress',
      description: 'Ouer WordPress-bladsye wat bewaar word sodat inhoud nie verlore raak nie',
    },
  })

  const eventCategory = await prisma.eventCategory.upsert({
    where: { name: 'Algemeen' },
    update: {},
    create: {
      name: 'Algemeen',
      color: '#A16207',
      description: 'Ingevoerde WordPress gebeure',
    },
  })

  let serviceGroups = 0
  let articles = 0
  let readingMaterials = 0
  let events = 0

  const sortedPages = [...pages].sort((a, b) => a.id - b.id)

  await prisma.serviceGroup.deleteMany({
    where: { slug: { in: placeholderServiceGroupSlugs } },
  })

  for (const page of sortedPages) {
    const title = titleOf(page)
    const content = contentOf(page)

    if (serviceGroupSlugs.has(page.slug)) {
      const serviceGroupTitle = titleForServiceGroup(page)
      const displayOrder = serviceGroupDisplayOrder.get(page.slug) ?? 100 + serviceGroups

      await prisma.serviceGroup.upsert({
        where: { slug: slugify(page.slug) },
        update: {
          name: serviceGroupTitle,
          description: content,
          category: categoryForServiceGroup(page),
          contactPerson: DEFAULT_CONTACT_PERSON,
          contactEmail: DEFAULT_CONTACT_EMAIL,
          thumbnailUrl: serviceGroupThumbnailUrls.get(page.slug),
          displayOrder,
          isActive: true,
        },
        create: {
          name: serviceGroupTitle,
          slug: slugify(page.slug),
          description: content,
          category: categoryForServiceGroup(page),
          contactPerson: DEFAULT_CONTACT_PERSON,
          contactEmail: DEFAULT_CONTACT_EMAIL,
          thumbnailUrl: serviceGroupThumbnailUrls.get(page.slug),
          displayOrder,
          isActive: true,
        },
      })
      serviceGroups++
      continue
    }

    if (readingSlugs.has(page.slug)) {
      await prisma.readingMaterial.upsert({
        where: { id: `wp-page-${page.id}` },
        update: {
          title,
          description: content,
          externalUrl: null,
          categoryId: readingCategory.id,
          fileType: ReadingMaterialFileType.LINK,
        },
        create: {
          id: `wp-page-${page.id}`,
          title,
          description: content,
          externalUrl: null,
          categoryId: readingCategory.id,
          fileType: ReadingMaterialFileType.LINK,
        },
      })
      readingMaterials++
      continue
    }

    if (newsSlugs.has(page.slug)) {
      const publishedAt = new Date(page.modified || page.date || Date.now())
      await prisma.article.upsert({
        where: { slug: slugify(page.slug) },
        update: {
          title,
          content,
          excerpt: truncate(content, 240),
          categoryId: articleCategory.id,
          status: ArticleStatus.PUBLISHED,
          publishedAt,
          authorId: admin.id,
        },
        create: {
          title,
          slug: slugify(page.slug),
          content,
          excerpt: truncate(content, 240),
          categoryId: articleCategory.id,
          status: ArticleStatus.PUBLISHED,
          publishedAt,
          authorId: admin.id,
        },
      })
      articles++
      continue
    }

    if (!singletonPageSlugs.has(page.slug)) {
      await prisma.readingMaterial.upsert({
        where: { id: `wp-archive-page-${page.id}` },
        update: {
          title,
          description: content,
          externalUrl: null,
          categoryId: archiveCategory.id,
          fileType: ReadingMaterialFileType.LINK,
        },
        create: {
          id: `wp-archive-page-${page.id}`,
          title,
          description: content,
          externalUrl: null,
          categoryId: archiveCategory.id,
          fileType: ReadingMaterialFileType.LINK,
        },
      })
      readingMaterials++
    }
  }

  for (const event of eventResponse.events || []) {
    const startDate = new Date(event.start_date)
    if (Number.isNaN(startDate.getTime())) continue

    const endDate = event.end_date ? new Date(event.end_date) : undefined
    const rawDescription = htmlToText(event.description || event.excerpt || '')
    const description = normalizeEventDescription(rawDescription)
    const sermonUrl = hasKerkdienstgemistStationLink(rawDescription)
      ? '/uitsendings'
      : event.url === KERKDIENSTGEMIST_STATION_URL
        ? '/uitsendings'
        : null

    await prisma.event.upsert({
      where: { id: `wp-event-${event.id}` },
      update: {
        title: htmlToText(event.title),
        description: truncate(description || htmlToText(event.title), 1800),
        startDate,
        endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : undefined,
        location: locationForEvent(event),
        categoryId: eventCategory.id,
        sermonUrl,
      },
      create: {
        id: `wp-event-${event.id}`,
        title: htmlToText(event.title),
        description: truncate(description || htmlToText(event.title), 1800),
        startDate,
        endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : undefined,
        location: locationForEvent(event),
        categoryId: eventCategory.id,
        sermonUrl,
      },
    })
    events++
  }

  console.log(
    JSON.stringify(
      {
        serviceGroups,
        articles,
        readingMaterials,
        events,
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
