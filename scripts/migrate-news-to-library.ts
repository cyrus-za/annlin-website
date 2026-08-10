#!/usr/bin/env tsx

import { ArticleStatus, ContentStatus } from '@prisma/client'

import { prisma } from '../lib/db'

const TARGET_CATEGORY = 'Gemeentenuus'
const ID_PREFIX = 'news-article-'

function readingMaterialId(articleId: string) {
  return `${ID_PREFIX}${articleId}`
}

function migratedContent(article: { title: string; content: string; featuredImageUrl: string | null }) {
  if (!article.featuredImageUrl || article.content.includes(article.featuredImageUrl)) return article.content
  return `![${article.title}](${article.featuredImageUrl})\n\n${article.content}`
}

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run')
  if (apply === dryRun) throw new Error('Choose exactly one mode: --dry-run or --apply.')

  const [articles, existingMaterials] = await Promise.all([
    prisma.article.findMany({
      orderBy: [{ contentDate: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        featuredImageUrl: true,
        contentDate: true,
        showDate: true,
        status: true,
      },
    }),
    prisma.readingMaterial.findMany({
      where: { id: { startsWith: ID_PREFIX } },
      select: { id: true },
    }),
  ])

  const existingIds = new Set(existingMaterials.map((material) => material.id))
  const candidates = articles.filter(
    (article) => article.status === ArticleStatus.PUBLISHED || existingIds.has(readingMaterialId(article.id))
  )

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', candidates: candidates.length, alreadyMigrated: existingIds.size }))
  if (!apply) return

  const category = await prisma.readingMaterialCategory.upsert({
    where: { name: TARGET_CATEGORY },
    update: { description: 'Historiese berigte en hoogtepunte uit die lewe van die gemeente.' },
    create: { name: TARGET_CATEGORY, description: 'Historiese berigte en hoogtepunte uit die lewe van die gemeente.' },
    select: { id: true },
  })

  for (const article of candidates) {
    await prisma.readingMaterial.upsert({
      where: { id: readingMaterialId(article.id) },
      update: {
        title: article.title,
        description: migratedContent(article),
        contentDate: article.contentDate,
        showDate: article.showDate,
        categoryId: category.id,
        status: ContentStatus.PUBLISHED,
        isArchived: false,
      },
      create: {
        id: readingMaterialId(article.id),
        title: article.title,
        description: migratedContent(article),
        contentDate: article.contentDate,
        showDate: article.showDate,
        categoryId: category.id,
        status: ContentStatus.PUBLISHED,
      },
    })

    if (article.status === ArticleStatus.PUBLISHED) {
      await prisma.article.update({ where: { id: article.id }, data: { status: ArticleStatus.ARCHIVED } })
    }
  }

  const [publishedArticles, migratedMaterials] = await Promise.all([
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    prisma.readingMaterial.count({ where: { id: { startsWith: ID_PREFIX }, status: ContentStatus.PUBLISHED, isArchived: false } }),
  ])

  console.log(JSON.stringify({ migratedMaterials, publishedArticles }))
  if (migratedMaterials !== candidates.length || publishedArticles !== 0) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'News migration failed.')
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
