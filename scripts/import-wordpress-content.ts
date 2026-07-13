#!/usr/bin/env tsx

import { ArticleStatus, ReadingMaterialFileType, ServiceGroupCategory } from '@prisma/client'
import { disconnectDatabase, prisma } from '../lib/db'
import { createArticleExcerpt } from '../lib/public-content'
import { contactDetailsForServiceGroup } from '../lib/service-group-contact-details'
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

const KERKDIENSTGEMIST_STATION_TEST_PATTERN =
  /\bhttps?:\/\/kerkdienstgemist\.nl\/stations\/1246[^\s]*/i
const YOUTUBE_SERMON_CHANNEL_PATTERN =
  /\bhttps?:\/\/(?:www\.)?youtube\.com\/channel\/UC4NmYnuAd0293vFhf1i-tpg[^\s]*/i

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
  const baseUrl = process.env['WORDPRESS_BASE_URL']
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

function attributeValue(tag: string, attribute: string) {
  const pattern = new RegExp(`\\b${attribute}=["']([^"']+)["']`, 'i')
  return tag.match(pattern)?.[1] || ''
}

function markdownImageFromAsset(src: string, alt = '') {
  if (!src) return ''
  return `\n\n![${decodeEntities(alt)}](${decodeEntities(src)})\n\n`
}

function markdownLinkFromAsset(href: string, label = '') {
  if (!href) return ''
  const cleanedHref = decodeEntities(href)
  const cleanedLabel = htmlToText(label || cleanedHref)
  return `[${cleanedLabel || cleanedHref}](${cleanedHref})`
}

function preserveAssetMarkup(html: string) {
  return decodeEntities(html)
    .replace(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, href, text) => {
      return markdownLinkFromAsset(href, text)
    })
    .replace(/<img\b[^>]*>/gi, (tag) => {
      const src = attributeValue(tag, 'src') || attributeValue(tag, 'data-src')
      const alt = attributeValue(tag, 'alt') || attributeValue(tag, 'title') || ''
      return markdownImageFromAsset(src, alt)
    })
    .replace(/\[et_pb_image\b[^\]]*]/gi, (shortcode) => {
      const src = attributeValue(shortcode, 'src')
      const title = attributeValue(shortcode, 'title_text')
      const url = attributeValue(shortcode, 'url')
      const parts = [markdownImageFromAsset(src, title)]

      if (url && url !== src) {
        parts.push(markdownLinkFromAsset(url, title ? `${title} oopmaak` : url))
      }

      return parts.filter(Boolean).join('\n')
    })
}

function hasKerkdienstgemistStationLink(value: string) {
  return (
    KERKDIENSTGEMIST_STATION_TEST_PATTERN.test(value) ||
    YOUTUBE_SERMON_CHANNEL_PATTERN.test(value)
  )
}

function normalizeEventDescription(value: string) {
  return value
    .replace(
      /\s*Vir die video uitsending,?\s*klik asb op die volgende skakel:\s*\bhttps?:\/\/(?:www\.)?youtube\.com\/channel\/UC4NmYnuAd0293vFhf1i-tpg[^\s]*/gi,
      ''
    )
    .replace(
      /\s*As u egter nie die betrokke erediens raaksien nie,\s*klik dan links bo op [“"]uploads[”"]\.\s*Dit behoort die webwerf op te dateer\./gi,
      ''
    )
    .replace(
      /\s*Vir die klankuitsending,?\s*klik op die volgende skakel:\s*\bhttps?:\/\/kerkdienstgemist\.nl\/stations\/1246[^\s]*/gi,
      ''
    )
    .replace(
      /\bhttps?:\/\/kerkdienstgemist\.nl\/stations\/1246[^\s]*/gi,
      ''
    )
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim()
}

function getWordPressBaseUrl() {
  const baseUrl = process.env['WORDPRESS_BASE_URL']

  if (!baseUrl) {
    throw new Error('WORDPRESS_BASE_URL is required to import legacy WordPress content.')
  }

  return baseUrl.replace(/\/+$/, '')
}

function getDefaultContactEmail() {
  const contactEmail = process.env['NEXT_PUBLIC_CONTACT_EMAIL']

  if (!contactEmail) {
    throw new Error('NEXT_PUBLIC_CONTACT_EMAIL is required to import service-group contacts.')
  }

  return contactEmail
}

function htmlToText(html = '', options: { preserveAssets?: boolean } = {}) {
  const preparedHtml = options.preserveAssets ? preserveAssetMarkup(html) : html
  const text = decodeEntities(
    preparedHtml
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

  const cleaned = options.preserveAssets ? text : replaceLegacySiteReferences(text)
  return cleaned.replace(/[ \t]{2,}/g, ' ').trim()
}

function titleOf(page: WpPage) {
  return htmlToText(page.title.rendered || page.slug)
}

function contentOf(page: WpPage) {
  const content = htmlToText(page.content.rendered || '', { preserveAssets: true })
  const excerpt = htmlToText(page.excerpt?.rendered || '', { preserveAssets: true })
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
  const defaultContactEmail = getDefaultContactEmail()

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
      const category = categoryForServiceGroup(page)
      const contactDetails = contactDetailsForServiceGroup(page.slug, category, defaultContactEmail)

      await prisma.serviceGroup.upsert({
        where: { slug: slugify(page.slug) },
        update: {
          name: serviceGroupTitle,
          description: content,
          category,
          contactPerson: contactDetails.contactPerson,
          contactEmail: contactDetails.contactEmail,
          contactPhone: contactDetails.contactPhone,
          thumbnailUrl: serviceGroupThumbnailUrls.get(page.slug),
          bannerUrl: serviceGroupThumbnailUrls.get(page.slug),
          displayOrder,
          isActive: true,
        },
        create: {
          name: serviceGroupTitle,
          slug: slugify(page.slug),
          description: content,
          category,
          contactPerson: contactDetails.contactPerson,
          contactEmail: contactDetails.contactEmail,
          contactPhone: contactDetails.contactPhone,
          thumbnailUrl: serviceGroupThumbnailUrls.get(page.slug),
          bannerUrl: serviceGroupThumbnailUrls.get(page.slug),
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
          excerpt: createArticleExcerpt(content, 240),
          categoryId: articleCategory.id,
          status: ArticleStatus.PUBLISHED,
          publishedAt,
          authorId: admin.id,
        },
        create: {
          title,
          slug: slugify(page.slug),
          content,
          excerpt: createArticleExcerpt(content, 240),
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
