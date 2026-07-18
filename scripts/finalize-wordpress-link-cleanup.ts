#!/usr/bin/env tsx

import { prisma, disconnectDatabase } from '../lib/db'

const DEAD_WORDPRESS_URLS = new Set([
  'https://www.annlin.co.za/wp-content/uploads/2021/12/Die-Fontein-2021-50-19-Desember-2021.pdf',
  'https://www.annlin.co.za/wp-content/uploads/2023/02/Die-Fontein-23-02-12-Februarie-2023-Web-1.pdf',
  'https://www.annlin.co.za/wp-content/uploads/2023/08/Kamp-inligting-en-tariewe-v2.pdf',
  'https://www.annlin.co.za/wp-content/uploads/2023/12/Die-Fontein-3-Desember-2023-WEB.pdf',
  'https://www.annlin.co.za/wp-content/uploads/2024/01/SUSTERSAAMTREK-2024-REGISTRASIEVORM.1.pdf',
  'https://www.annlin.co.za/wp-content/uploads/2024/01/Sustersaamtrek-2024.png',
  'https://www.annlin.co.za/wp-content/uploads/2024/01/Aanwysings-Sustersaamtrek-2024.png',
  'https://www.annlin.co.za/wp-content/uploads/2025/03/2025-03-02-Oggend-Preeksamevatting.pdf',
])

const ARTICLE_SLUGS = [
  'nuus-2021',
  'nuus-2022',
  'nuus-2023',
  'susters-saamtrek-2024',
] as const

const READING_TITLES = ['Preek Samevattings'] as const

function filenameFromUrl(value: string) {
  try {
    return decodeURIComponent(new URL(value).pathname.split('/').pop() || '')
  } catch {
    return value.split('/').pop() || ''
  }
}

function normalizeBlankLines(value: string) {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function replaceArchivedUrls(value: string, archivedUrlByFilename: ReadonlyMap<string, string>) {
  return value.replace(
    /https?:\/\/(?:www\.)?annlin\.co\.za\/wp-content\/uploads\/[^\s<>"')\]]+/gi,
    (match) => archivedUrlByFilename.get(filenameFromUrl(match)) || match.replace(/^http:/i, 'https:')
  )
}

function removeDeadAssetLines(value: string) {
  const lines = value.split('\n')
  const keptLines = lines.filter((line) => {
    const normalizedLine = line.trim()
    if (!normalizedLine) return true

    for (const url of DEAD_WORDPRESS_URLS) {
      if (normalizedLine.includes(url)) return false
    }

    return true
  })

  return normalizeBlankLines(keptLines.join('\n'))
}

function cleanupField(
  value: string | null | undefined,
  archivedUrlByFilename: ReadonlyMap<string, string>
) {
  if (!value) return value ?? null
  return removeDeadAssetLines(replaceArchivedUrls(value, archivedUrlByFilename))
}

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run')

  if (apply === dryRun) {
    throw new Error('Choose exactly one mode: --dry-run or --apply.')
  }

  const [uploadedAssets, articles, readingMaterials] = await Promise.all([
    prisma.uploadedAsset.findMany({ select: { filename: true, url: true } }),
    prisma.article.findMany({
      where: { slug: { in: [...ARTICLE_SLUGS] } },
      select: {
        id: true,
        slug: true,
        content: true,
        excerpt: true,
        featuredImageUrl: true,
      },
    }),
    prisma.readingMaterial.findMany({
      where: { title: { in: [...READING_TITLES] } },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        externalUrl: true,
      },
    }),
  ])

  const archivedUrlByFilename = new Map(uploadedAssets.map((asset) => [asset.filename, asset.url]))
  const articleChanges = articles
    .map((article) => {
      const content = cleanupField(article.content, archivedUrlByFilename) || article.content
      const excerpt = cleanupField(article.excerpt, archivedUrlByFilename)
      const featuredImageUrl = cleanupField(article.featuredImageUrl, archivedUrlByFilename)

      return {
        ...article,
        next: { content, excerpt, featuredImageUrl },
      }
    })
    .filter(
      (article) =>
        article.next.content !== article.content ||
        article.next.excerpt !== article.excerpt ||
        article.next.featuredImageUrl !== article.featuredImageUrl
    )

  const readingChanges = readingMaterials
    .map((item) => {
      const description = cleanupField(item.description, archivedUrlByFilename)
      const fileUrl = cleanupField(item.fileUrl, archivedUrlByFilename)
      const externalUrl = cleanupField(item.externalUrl, archivedUrlByFilename)

      return {
        ...item,
        next: { description, fileUrl, externalUrl },
      }
    })
    .filter(
      (item) =>
        item.next.description !== item.description ||
        item.next.fileUrl !== item.fileUrl ||
        item.next.externalUrl !== item.externalUrl
    )

  if (apply) {
    await prisma.$transaction([
      ...articleChanges.map((article) =>
        prisma.article.update({
          where: { id: article.id },
          data: article.next,
        })
      ),
      ...readingChanges.map((item) =>
        prisma.readingMaterial.update({
          where: { id: item.id },
          data: item.next,
        })
      ),
    ])
  }

  console.log(
    JSON.stringify(
      {
        apply,
        changedArticles: articleChanges.map((article) => ({
          slug: article.slug,
          contentChanged: article.next.content !== article.content,
          excerptChanged: article.next.excerpt !== article.excerpt,
          featuredImageChanged: article.next.featuredImageUrl !== article.featuredImageUrl,
        })),
        changedReadingMaterials: readingChanges.map((item) => ({
          title: item.title,
          descriptionChanged: item.next.description !== item.description,
          fileUrlChanged: item.next.fileUrl !== item.fileUrl,
          externalUrlChanged: item.next.externalUrl !== item.externalUrl,
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
