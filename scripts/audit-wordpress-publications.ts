#!/usr/bin/env tsx

import { disconnectDatabase, prisma } from '../lib/db'
import { canonicalWordPressDocuments, type WordPressDocument } from '../lib/wordpress-publications'

const USER_AGENT = 'Annlin WordPress publication audit'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value.replace(/\/+$/, '')
}

async function fetchAllMedia(baseUrl: string) {
  const documents: WordPressDocument[] = []
  let totalPages = 1
  for (let page = 1; page <= totalPages; page++) {
    const response = await fetch(
      `${baseUrl}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=id,date,source_url,mime_type,title`,
      { headers: { accept: 'application/json', 'user-agent': USER_AGENT } }
    )
    if (!response.ok) throw new Error(`WordPress media fetch failed (${response.status}) on page ${page}.`)
    totalPages = Number(response.headers.get('x-wp-totalpages') || 1)
    documents.push(...await response.json() as WordPressDocument[])
  }
  return documents
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, mapper: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length)
  let cursor = 0
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++
        results[index] = await mapper(items[index])
      }
    })
  )
  return results
}

async function main() {
  const wordpressBaseUrl = requiredEnv('WORDPRESS_BASE_URL')
  const r2BaseUrl = requiredEnv('R2_PUBLIC_BASE_URL')
  const canonical = canonicalWordPressDocuments(await fetchAllMedia(wordpressBaseUrl))
  const records = await prisma.readingMaterial.findMany({
    where: { sourceMediaId: { in: canonical.map(({ document }) => document.id) } },
    include: { category: true },
  })
  const recordBySourceId = new Map(records.map((record) => [record.sourceMediaId, record]))
  const missingRecords = canonical.filter(({ document }) => !recordBySourceId.has(document.id))
  const invalidRecords = canonical.flatMap(({ document, classification }) => {
    const record = recordBySourceId.get(document.id)
    if (!record) return []
    const problems = [
      record.category.name !== classification.category ? 'category' : null,
      record.contentDate.toISOString().slice(0, 10) !== classification.contentDate.toISOString().slice(0, 10) ? 'contentDate' : null,
      record.status !== 'PUBLISHED' ? 'status' : null,
      !record.fileUrl?.startsWith(`${r2BaseUrl}/`) ? 'fileUrl' : null,
      !record.fileSize || record.fileSize <= 0 ? 'fileSize' : null,
    ].filter(Boolean)
    return problems.length > 0 ? [{ sourceMediaId: document.id, problems }] : []
  })

  const urlChecks = await mapWithConcurrency(records, 10, async (record) => {
    try {
      const response = await fetch(record.fileUrl || '', { method: 'HEAD', headers: { 'user-agent': USER_AGENT } })
      const remoteSize = Number(response.headers.get('content-length') || 0)
      await response.body?.cancel()
      return {
        id: record.id,
        ok: response.ok && (remoteSize === 0 || remoteSize === record.fileSize),
        status: response.status,
        expectedSize: record.fileSize,
        remoteSize,
      }
    } catch {
      return { id: record.id, ok: false, status: 0, expectedSize: record.fileSize, remoteSize: 0 }
    }
  })
  const failedUrls = urlChecks.filter((result) => !result.ok)
  const annualNews = await prisma.article.findMany({
    where: { slug: { in: ['nuus-2021', 'nuus-2022', 'nuus-2023', 'nuus-2024', 'nuus-2026'] } },
    select: { slug: true, status: true },
  })
  const publicAnnualNews = annualNews.filter((article) => article.status !== 'ARCHIVED')
  const ready = missingRecords.length === 0 && invalidRecords.length === 0 && failedUrls.length === 0 && publicAnnualNews.length === 0

  console.log(JSON.stringify({
    summary: {
      canonicalDocuments: canonical.length,
      publicationRecords: records.length,
      missingRecords: missingRecords.length,
      invalidRecords: invalidRecords.length,
      successfulR2Urls: urlChecks.length - failedUrls.length,
      failedR2Urls: failedUrls.length,
      archivedAnnualNews: annualNews.length - publicAnnualNews.length,
      semanticMigrationReady: ready,
    },
    missingSourceMediaIds: missingRecords.map(({ document }) => document.id),
    invalidRecords,
    failedUrls: failedUrls.slice(0, 25),
    publicAnnualNews,
  }, null, 2))

  if (!ready) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
