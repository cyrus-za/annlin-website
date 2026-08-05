#!/usr/bin/env tsx

import { ContentStatus } from '@prisma/client'
import { disconnectDatabase, prisma } from '../lib/db'
import {
  canonicalWordPressDocuments,
  PUBLICATION_CATEGORIES,
  type WordPressDocument,
} from '../lib/wordpress-publications'

const USER_AGENT = 'Annlin WordPress publication importer'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value.replace(/\/+$/, '')
}

async function fetchPage(baseUrl: string, page: number) {
  const fields = 'id,date,source_url,mime_type,title'
  const response = await fetch(
    `${baseUrl}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=${fields}`,
    { headers: { accept: 'application/json', 'user-agent': USER_AGENT } }
  )
  if (!response.ok) throw new Error(`WordPress media fetch failed (${response.status}) on page ${page}.`)
  return {
    documents: (await response.json()) as WordPressDocument[],
    totalPages: Number(response.headers.get('x-wp-totalpages') || 1),
  }
}

async function fetchAllMedia(baseUrl: string) {
  const first = await fetchPage(baseUrl, 1)
  const documents = [...first.documents]
  for (let page = 2; page <= first.totalPages; page++) {
    documents.push(...(await fetchPage(baseUrl, page)).documents)
  }
  return documents
}

async function main() {
  const apply = process.argv.includes('--apply')
  const wordpressBaseUrl = requiredEnv('WORDPRESS_BASE_URL')
  const media = await fetchAllMedia(wordpressBaseUrl)
  const canonical = canonicalWordPressDocuments(media)
  const sourceDocumentCount = media.filter(
    (item) => item.mime_type === 'application/pdf' || item.mime_type === 'audio/mpeg' || item.mime_type.includes('presentation')
  ).length
  const assets = await prisma.uploadedAsset.findMany({
    where: { id: { in: canonical.map(({ document }) => `wp-media-${document.id}`) } },
  })
  const assetById = new Map(assets.map((asset) => [asset.id, asset]))
  const missingAssets = canonical.filter(({ document }) => !assetById.has(`wp-media-${document.id}`))

  if (missingAssets.length > 0) {
    throw new Error(`Missing R2 inventory rows for ${missingAssets.length} canonical documents.`)
  }

  const categoryCounts = Object.fromEntries(
    PUBLICATION_CATEGORIES.map((name) => [
      name,
      canonical.filter(({ classification }) => classification.category === name).length,
    ])
  )

  if (!apply) {
    console.log(
      JSON.stringify(
        {
          apply: false,
          sourceDocumentCount,
          canonicalDocumentCount: canonical.length,
          skippedDuplicateVariants: sourceDocumentCount - canonical.length,
          categoryCounts,
          missingAssets: missingAssets.length,
        },
        null,
        2
      )
    )
    return
  }

  const categoryByName = new Map<string, { id: string }>()
  for (const name of PUBLICATION_CATEGORIES) {
    const category = await prisma.readingMaterialCategory.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} in die gemeente se hulpbronbiblioteek.` },
      select: { id: true },
    })
    categoryByName.set(name, category)
  }

  for (const { document, classification } of canonical) {
    const asset = assetById.get(`wp-media-${document.id}`)
    const category = categoryByName.get(classification.category)
    if (!asset || !category) throw new Error(`Missing import dependency for media ${document.id}.`)

    await prisma.readingMaterial.upsert({
      where: { sourceMediaId: document.id },
      update: {
        title: classification.title,
        description: classification.description,
        fileUrl: asset.url,
        externalUrl: null,
        categoryId: category.id,
        fileType: classification.fileType,
        fileSize: asset.size,
        contentDate: classification.contentDate,
        showDate: true,
        status: ContentStatus.PUBLISHED,
        isArchived: classification.isArchived,
      },
      create: {
        id: `wp-publication-${document.id}`,
        sourceMediaId: document.id,
        title: classification.title,
        description: classification.description,
        fileUrl: asset.url,
        categoryId: category.id,
        fileType: classification.fileType,
        fileSize: asset.size,
        contentDate: classification.contentDate,
        showDate: true,
        status: ContentStatus.PUBLISHED,
        isArchived: classification.isArchived,
      },
    })
  }

  const archivedAnnualNews = await prisma.article.updateMany({
    where: { slug: { in: ['nuus-2021', 'nuus-2022', 'nuus-2023', 'nuus-2024', 'nuus-2026'] } },
    data: { status: 'ARCHIVED' },
  })
  await prisma.readingMaterial.updateMany({
    where: { id: { startsWith: 'wp-archive-page-' } },
    data: { isArchived: true },
  })

  console.log(
    JSON.stringify(
      {
        apply: true,
        sourceDocumentCount,
        imported: canonical.length,
        skippedDuplicateVariants: sourceDocumentCount - canonical.length,
        categoryCounts,
        archivedAnnualNews: archivedAnnualNews.count,
      },
      null,
      2
    )
  )
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
