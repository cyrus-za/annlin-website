#!/usr/bin/env tsx

import { ArticleStatus, ReadingMaterialFileType, ServiceGroupCategory } from '@prisma/client'
import { disconnectDatabase, prisma } from '../lib/db'
import { slugify } from '../lib/slug'

const WORDPRESS_BASE_URL = 'https://www.annlin.co.za'
const DEFAULT_CONTACT_EMAIL = 'kerkkantoor@annlin.co.za'
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
  [
    'hospitaalbesoeke',
    'https://www.annlin.co.za/wp-content/uploads/2026/06/siekebesoeke-2-300x300.png',
  ],
  ['seniors-2', 'https://www.annlin.co.za/wp-content/uploads/2026/06/seniors-2-300x300.png'],
  ['jeugbediening', 'https://www.annlin.co.za/wp-content/uploads/2026/06/jeug2-300x300.png'],
  ['sosiale-dienste', 'https://www.annlin.co.za/wp-content/uploads/2026/06/sosiaal2-300x300.png'],
  [
    'tradisionele-dienste',
    'https://www.annlin.co.za/wp-content/uploads/2026/06/traditionele2-300x300.png',
  ],
  [
    'versorging-en-barmhartigheid-2',
    'https://www.annlin.co.za/wp-content/uploads/2026/06/Versorging-en-Barmhartigheid-2-300x300.png',
  ],
  ['vervoer-2', 'https://www.annlin.co.za/wp-content/uploads/2026/06/vervoer2-300x300.png'],
  [
    'verwelkoming-en-gasvryheid',
    'https://www.annlin.co.za/wp-content/uploads/2026/06/Welkom-2-300x300.png',
  ],
  [
    'gebedsgroepe',
    'https://www.annlin.co.za/wp-content/uploads/2026/06/Gebedsgroep-2-300x300.png',
  ],
  [
    'evangelisasie-blad',
    'https://www.annlin.co.za/wp-content/uploads/2026/06/Evangelisasie-2-300x293.png',
  ],
  [
    'tweedehandse-goedere-verkopings',
    'https://www.annlin.co.za/wp-content/uploads/2026/06/thv-2-300x300.png',
  ],
  [
    'terebinte',
    'https://www.annlin.co.za/wp-content/uploads/2024/12/Terebinte-boom2-300x169.jpg',
  ],
  ['susters', 'https://www.annlin.co.za/wp-content/uploads/2026/06/susters-2-300x300.png'],
  ['sekuriteit', 'https://www.annlin.co.za/wp-content/uploads/2026/06/Sekuriteit-2-300x300.png'],
  [
    'fontein-redaksie',
    'https://www.annlin.co.za/wp-content/uploads/2026/06/Fontein-Redaksie-2-300x300.png',
  ],
  [
    'vroue-bedieningsgroep',
    'https://www.annlin.co.za/wp-content/uploads/2026/06/vroue-2-300x300.png',
  ],
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

function decodeEntities(value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&#038;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#8220;', '"')
    .replaceAll('&#8221;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#8211;', '-')
    .replaceAll('&#8217;', "'")
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function htmlToText(html = '') {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim()
  )
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

  const pages = await fetchJson<WpPage[]>(
    `${WORDPRESS_BASE_URL}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,link,title,content,excerpt,modified,date`
  )
  const eventResponse = await fetchJson<{ events?: TribeEvent[] }>(
    `${WORDPRESS_BASE_URL}/wp-json/tribe/events/v1/events?per_page=100`
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

  await prisma.serviceGroup.updateMany({
    where: { slug: { in: placeholderServiceGroupSlugs } },
    data: { isActive: false },
  })

  await prisma.serviceGroup.updateMany({
    where: { slug: { notIn: [...serviceGroupSlugs] } },
    data: { isActive: false },
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
          description: truncate(content, 2400),
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
          description: truncate(content, 2400),
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
          description: truncate(content, 3000),
          externalUrl: null,
          categoryId: readingCategory.id,
          fileType: ReadingMaterialFileType.LINK,
        },
        create: {
          id: `wp-page-${page.id}`,
          title,
          description: truncate(content, 3000),
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
    }
  }

  for (const event of eventResponse.events || []) {
    const startDate = new Date(event.start_date)
    if (Number.isNaN(startDate.getTime())) continue

    const endDate = event.end_date ? new Date(event.end_date) : undefined
    const description = htmlToText(event.description || event.excerpt || '')

    await prisma.event.upsert({
      where: { id: `wp-event-${event.id}` },
      update: {
        title: htmlToText(event.title),
        description: truncate(description || htmlToText(event.title), 1800),
        startDate,
        endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : undefined,
        location: locationForEvent(event),
        categoryId: eventCategory.id,
      },
      create: {
        id: `wp-event-${event.id}`,
        title: htmlToText(event.title),
        description: truncate(description || htmlToText(event.title), 1800),
        startDate,
        endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : undefined,
        location: locationForEvent(event),
        categoryId: eventCategory.id,
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
