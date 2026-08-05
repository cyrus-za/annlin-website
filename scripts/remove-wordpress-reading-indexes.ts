#!/usr/bin/env tsx

import { disconnectDatabase, prisma } from '../lib/db'

const indexPages = new Map([
  ['wp-page-1805', 2],
  ['wp-page-12110', 5],
  ['wp-page-3199', 11],
  ['wp-page-3520', 28],
])

const mediaLinkPattern = /\((https?:\/\/[^)]+\.(?:pdf|mp3|docx?)(?:[?#][^)]*)?)\)/gi

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run')

  if (apply === dryRun) {
    throw new Error('Choose exactly one mode: --dry-run or --apply.')
  }

  const ids = [...indexPages.keys()]
  const [pages, publications] = await Promise.all([
    prisma.readingMaterial.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, description: true },
    }),
    prisma.readingMaterial.findMany({
      where: { id: { notIn: ids } },
      select: { fileUrl: true, externalUrl: true },
    }),
  ])

  const publicationUrls = new Set(
    publications
      .flatMap((item) => [item.fileUrl, item.externalUrl])
      .filter((url): url is string => Boolean(url))
  )
  const audit = pages.map((page) => {
    const mediaUrls = new Set(
      [...(page.description || '').matchAll(mediaLinkPattern)]
        .map((match) => match[1])
        .filter((url): url is string => Boolean(url))
    )
    const matched = [...mediaUrls].filter((url) => publicationUrls.has(url)).length
    const expected = indexPages.get(page.id) || 0

    return {
      id: page.id,
      title: page.title,
      mediaLinks: mediaUrls.size,
      matchingPublicationRows: matched,
      safeToRemove: mediaUrls.size >= expected && matched === mediaUrls.size,
    }
  })

  const missingIds = ids.filter((id) => !pages.some((page) => page.id === id))
  const unsafe = audit.filter((item) => !item.safeToRemove)

  if (unsafe.length > 0) {
    throw new Error(`Index pages still contain unmatched media: ${unsafe.map((item) => item.id).join(', ')}`)
  }

  if (apply && pages.length > 0) {
    await prisma.readingMaterial.deleteMany({
      where: { id: { in: pages.map((page) => page.id) } },
    })
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'dry-run',
        removed: apply ? pages.length : 0,
        alreadyAbsent: missingIds,
        pages: audit,
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
