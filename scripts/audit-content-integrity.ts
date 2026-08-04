#!/usr/bin/env tsx

import { auditContentMarkdown, extractContentUrls, normalizeContentMarkdown } from '../lib/content-integrity'
import { prisma } from '../lib/db'

type MarkdownRecord = {
  model: 'Article' | 'Event' | 'ReadingMaterial' | 'ServiceGroup'
  id: string
  label: string
  field: 'content' | 'description'
  value: string
}

type TextRecord = MarkdownRecord | {
  model: string
  id: string
  label: string
  field: string
  value: string
}

function jsonStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(jsonStrings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(jsonStrings)
  return []
}

async function loadRecords() {
  const [articles, materials, serviceGroups, events, contentPages, articleCategories, materialCategories, eventCategories] = await Promise.all([
    prisma.article.findMany({ select: { id: true, title: true, content: true, excerpt: true, featuredImageUrl: true } }),
    prisma.readingMaterial.findMany({ select: { id: true, title: true, description: true, fileUrl: true, externalUrl: true } }),
    prisma.serviceGroup.findMany({ select: { id: true, name: true, description: true, bannerUrl: true, thumbnailUrl: true } }),
    prisma.event.findMany({ select: { id: true, title: true, description: true, sermonUrl: true } }),
    prisma.contentPage.findMany({ select: { id: true, title: true, description: true, sections: true } }),
    prisma.articleCategory.findMany({ select: { id: true, name: true, description: true } }),
    prisma.readingMaterialCategory.findMany({ select: { id: true, name: true, description: true } }),
    prisma.eventCategory.findMany({ select: { id: true, name: true, description: true } }),
  ])

  const markdownRecords: MarkdownRecord[] = [
    ...articles.map((item) => ({ model: 'Article' as const, id: item.id, label: item.title, field: 'content' as const, value: item.content })),
    ...materials.map((item) => ({ model: 'ReadingMaterial' as const, id: item.id, label: item.title, field: 'description' as const, value: item.description || '' })),
    ...serviceGroups.map((item) => ({ model: 'ServiceGroup' as const, id: item.id, label: item.name, field: 'description' as const, value: item.description })),
    ...events.map((item) => ({ model: 'Event' as const, id: item.id, label: item.title, field: 'description' as const, value: item.description })),
  ]
  const textRecords: TextRecord[] = [
    ...markdownRecords,
    ...articles.flatMap((item) => [
      { model: 'Article', id: item.id, label: item.title, field: 'excerpt', value: item.excerpt || '' },
      { model: 'Article', id: item.id, label: item.title, field: 'featuredImageUrl', value: item.featuredImageUrl || '' },
    ]),
    ...materials.flatMap((item) => [
      { model: 'ReadingMaterial', id: item.id, label: item.title, field: 'fileUrl', value: item.fileUrl || '' },
      { model: 'ReadingMaterial', id: item.id, label: item.title, field: 'externalUrl', value: item.externalUrl || '' },
    ]),
    ...serviceGroups.flatMap((item) => [
      { model: 'ServiceGroup', id: item.id, label: item.name, field: 'bannerUrl', value: item.bannerUrl || '' },
      { model: 'ServiceGroup', id: item.id, label: item.name, field: 'thumbnailUrl', value: item.thumbnailUrl || '' },
    ]),
    ...events.map((item) => ({ model: 'Event', id: item.id, label: item.title, field: 'sermonUrl', value: item.sermonUrl || '' })),
    ...contentPages.flatMap((item) => [
      { model: 'ContentPage', id: item.id, label: item.title, field: 'description', value: item.description || '' },
      ...jsonStrings(item.sections).map((value, index) => ({ model: 'ContentPage', id: item.id, label: item.title, field: `sections[${index}]`, value })),
    ]),
    ...articleCategories.map((item) => ({ model: 'ArticleCategory', id: item.id, label: item.name, field: 'description', value: item.description || '' })),
    ...materialCategories.map((item) => ({ model: 'ReadingMaterialCategory', id: item.id, label: item.name, field: 'description', value: item.description || '' })),
    ...eventCategories.map((item) => ({ model: 'EventCategory', id: item.id, label: item.name, field: 'description', value: item.description || '' })),
  ]

  return { markdownRecords, textRecords }
}

async function checkUrl(value: string, siteUrl: string) {
  if (/^(?:mailto:|tel:|#)/i.test(value)) return null

  let url: URL
  try {
    url = new URL(value, siteUrl)
  } catch {
    return { url: value, status: 0, error: 'Invalid URL' }
  }

  if (!/^https?:$/.test(url.protocol)) return { url: value, status: 0, error: 'Unsafe URL scheme' }

  try {
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15_000) })
    if (response.status === 403 || response.status === 405) {
      response = await fetch(url, {
        headers: { range: 'bytes=0-0' },
        redirect: 'follow',
        signal: AbortSignal.timeout(15_000),
      })
    }
    return response.ok ? null : { url: url.toString(), status: response.status, error: response.statusText }
  } catch (error) {
    return { url: url.toString(), status: 0, error: error instanceof Error ? error.message : 'Request failed' }
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const checkUrls = process.argv.includes('--check-urls')
  const siteUrl = (process.env['SITE_URL'] || 'https://annlin.venter.pro').replace(/\/+$/, '')
  const { markdownRecords, textRecords } = await loadRecords()
  const changes = markdownRecords
    .map((record) => ({ ...record, normalized: normalizeContentMarkdown(record.value) }))
    .filter((record) => record.normalized !== record.value)

  if (apply) {
    await prisma.$transaction(async (tx) => {
      for (const change of changes) {
        const data = { [change.field]: change.normalized }
        if (change.model === 'Article') await tx.article.update({ where: { id: change.id }, data })
        if (change.model === 'ReadingMaterial') await tx.readingMaterial.update({ where: { id: change.id }, data })
        if (change.model === 'ServiceGroup') await tx.serviceGroup.update({ where: { id: change.id }, data })
        if (change.model === 'Event') await tx.event.update({ where: { id: change.id }, data })
      }
    })
  }

  const recordsAfter = new Map(changes.map((change) => [`${change.model}:${change.id}:${change.field}`, change.normalized]))
  const findings = textRecords.flatMap((record) => {
    const key = `${record.model}:${record.id}:${record.field}`
    const value = apply ? recordsAfter.get(key) || record.value : record.value
    const issues = auditContentMarkdown(value)
    return Object.keys(issues).length > 0 ? [{ ...record, value: undefined, issues }] : []
  })

  let failedUrls: Awaited<ReturnType<typeof checkUrl>>[] = []
  let urlsChecked = 0
  if (checkUrls) {
    const urls = [...new Set(textRecords.flatMap((record) => extractContentUrls(record.value)).concat(
      textRecords.filter((record) => /Url$/.test(record.field) && record.value).map((record) => record.value)
    ))]
    urlsChecked = urls.length
    const results = await Promise.all(urls.map((url) => checkUrl(url, siteUrl)))
    failedUrls = results.filter((result): result is NonNullable<typeof result> => result !== null)
  }

  const issueTotals = findings.reduce<Record<string, number>>((totals, finding) => {
    for (const [issue, count] of Object.entries(finding.issues)) totals[issue] = (totals[issue] || 0) + count
    return totals
  }, {})

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'audit',
    recordsScanned: new Set(textRecords.map((record) => `${record.model}:${record.id}`)).size,
    markdownFieldsScanned: markdownRecords.length,
    recordsChanged: changes.length,
    changes: changes.map(({ model, id, label, field }) => ({ model, id, label, field })),
    issueTotals,
    findings,
    urlsChecked,
    failedUrls,
  }, null, 2))

  if (findings.length > 0 || failedUrls.length > 0) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
