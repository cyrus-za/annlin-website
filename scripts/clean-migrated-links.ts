#!/usr/bin/env tsx

import { Prisma } from '@prisma/client'

import { disconnectDatabase, prisma } from '../lib/db'
import {
  createArticleExcerpt,
  normalizeArticleContent,
  normalizeGoogleMapsLinks,
  normalizeReadingMaterialContent,
  normalizeServiceGroupContent,
} from '../lib/public-content'
import {
  buildWordPressPageRouteMap,
  replaceWordPressPageLinks,
} from '../lib/wordpress-migration'

type WpPage = {
  id: number
  slug: string
}

type Change = {
  model: string
  id: string
  fields: string[]
}

const singletonPageRoutes = new Map([
  ['homepagenew', '/'],
  ['oor-annlin-gemeente', '/oor-annlin-gemeente'],
  ['jaarprogram', '/jaarprogram'],
  ['kontakbesonderhede', '/kontakbesonderhede'],
  ['onlangse-video-uitsendings-van-preke', '/uitsendings'],
])

function getWordPressBaseUrl() {
  const value = process.env['WORDPRESS_BASE_URL']

  if (!value) {
    throw new Error('WORDPRESS_BASE_URL is required to clean migrated links.')
  }

  return value.replace(/\/+$/, '')
}

async function fetchWordPressPages(wordpressBaseUrl: string) {
  const response = await fetch(
    `${wordpressBaseUrl}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug`,
    {
      headers: {
        accept: 'application/json',
        'user-agent': 'Annlin migrated link cleanup',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Could not fetch WordPress pages (${response.status}).`)
  }

  return response.json() as Promise<WpPage[]>
}

function changedFields(before: Record<string, unknown>, after: Record<string, unknown>) {
  return Object.keys(after).filter((field) => before[field] !== after[field])
}

function mapJsonStrings(
  value: Prisma.JsonValue | undefined,
  transform: (value: string) => string
): Prisma.JsonValue | undefined {
  if (typeof value === 'string') return transform(value)
  if (Array.isArray(value)) return value.map((item) => mapJsonStrings(item, transform) ?? null)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, mapJsonStrings(item, transform)])
    )
  }
  return value
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const wordpressBaseUrl = getWordPressBaseUrl()
  const [pages, serviceGroups, articles, readingMaterials, events, contentPages] =
    await Promise.all([
      fetchWordPressPages(wordpressBaseUrl),
      prisma.serviceGroup.findMany(),
      prisma.article.findMany(),
      prisma.readingMaterial.findMany(),
      prisma.event.findMany(),
      prisma.contentPage.findMany(),
    ])

  const serviceGroupSlugs = new Set(serviceGroups.map((group) => group.slug))
  const newsSlugs = new Set(articles.map((article) => article.slug))
  const readingIds = new Set(readingMaterials.map((material) => material.id))
  const readingSlugs = new Set(
    pages
      .filter((page) => readingIds.has(`wp-page-${page.id}`))
      .map((page) => page.slug)
  )
  const routes = buildWordPressPageRouteMap(pages, {
    serviceGroupSlugs,
    newsSlugs,
    readingSlugs,
    singletonRoutes: singletonPageRoutes,
  })
  const cleanLinks = (value: string) =>
    normalizeGoogleMapsLinks(replaceWordPressPageLinks(value, wordpressBaseUrl, routes))
  const changes: Change[] = []

  for (const article of articles) {
    const content = normalizeArticleContent(cleanLinks(article.content))
    const after = {
      content,
      excerpt: createArticleExcerpt(content, 240),
      featuredImageUrl: article.featuredImageUrl
        ? cleanLinks(article.featuredImageUrl)
        : article.featuredImageUrl,
    }
    const fields = changedFields(article, after)
    if (fields.length === 0) continue

    changes.push({ model: 'Article', id: article.id, fields })
    if (!dryRun) await prisma.article.update({ where: { id: article.id }, data: after })
  }

  for (const material of readingMaterials) {
    const after = {
      description: material.description
        ? normalizeReadingMaterialContent(cleanLinks(material.description), material.title)
        : material.description,
      fileUrl: material.fileUrl ? cleanLinks(material.fileUrl) : material.fileUrl,
      externalUrl: material.externalUrl ? cleanLinks(material.externalUrl) : material.externalUrl,
    }
    const fields = changedFields(material, after)
    if (fields.length === 0) continue

    changes.push({ model: 'ReadingMaterial', id: material.id, fields })
    if (!dryRun) {
      await prisma.readingMaterial.update({ where: { id: material.id }, data: after })
    }
  }

  for (const group of serviceGroups) {
    const after = {
      description: normalizeServiceGroupContent(cleanLinks(group.description), group.name),
      thumbnailUrl: group.thumbnailUrl ? cleanLinks(group.thumbnailUrl) : group.thumbnailUrl,
      bannerUrl: group.bannerUrl ? cleanLinks(group.bannerUrl) : group.bannerUrl,
    }
    const fields = changedFields(group, after)
    if (fields.length === 0) continue

    changes.push({ model: 'ServiceGroup', id: group.id, fields })
    if (!dryRun) await prisma.serviceGroup.update({ where: { id: group.id }, data: after })
  }

  for (const event of events) {
    const after = {
      description: cleanLinks(event.description),
      location: event.location ? cleanLinks(event.location) : event.location,
      sermonUrl: event.sermonUrl ? cleanLinks(event.sermonUrl) : event.sermonUrl,
    }
    const fields = changedFields(event, after)
    if (fields.length === 0) continue

    changes.push({ model: 'Event', id: event.id, fields })
    if (!dryRun) await prisma.event.update({ where: { id: event.id }, data: after })
  }

  for (const page of contentPages) {
    const sections = mapJsonStrings(page.sections, cleanLinks)
    if (JSON.stringify(sections) === JSON.stringify(page.sections)) continue

    changes.push({ model: 'ContentPage', id: page.id, fields: ['sections'] })
    if (!dryRun) {
      await prisma.contentPage.update({
        where: { id: page.id },
        data: { sections: sections as Prisma.InputJsonValue },
      })
    }
  }

  const byModel = Object.fromEntries(
    [...new Set(changes.map((change) => change.model))].map((model) => [
      model,
      changes.filter((change) => change.model === model).length,
    ])
  )

  console.log(
    JSON.stringify(
      {
        dryRun,
        scanned: {
          articles: articles.length,
          readingMaterials: readingMaterials.length,
          serviceGroups: serviceGroups.length,
          events: events.length,
          contentPages: contentPages.length,
        },
        changed: changes.length,
        byModel,
        changes,
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
