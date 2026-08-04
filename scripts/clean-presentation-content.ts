#!/usr/bin/env tsx

import { disconnectDatabase, prisma } from '../lib/db'
import { createArticleExcerpt, normalizeEventTitle } from '../lib/public-content'

const legacyNewsSlug = 'nuus-2025'
const canonicalNewsSlug = 'nuus-2026'

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run')

  if (apply === dryRun) {
    throw new Error('Choose exactly one mode: --dry-run or --apply.')
  }

  const [events, legacyArticle, canonicalArticle] = await Promise.all([
    prisma.event.findMany({ select: { id: true, title: true } }),
    prisma.article.findUnique({ where: { slug: legacyNewsSlug } }),
    prisma.article.findUnique({ where: { slug: canonicalNewsSlug } }),
  ])

  if (legacyArticle && canonicalArticle && legacyArticle.id !== canonicalArticle.id) {
    throw new Error(`Both ${legacyNewsSlug} and ${canonicalNewsSlug} already exist.`)
  }

  const eventChanges = events
    .map((event) => ({ ...event, normalizedTitle: normalizeEventTitle(event.title) }))
    .filter((event) => event.normalizedTitle !== event.title)
  const article = legacyArticle || canonicalArticle
  const nextExcerpt = article ? createArticleExcerpt(article.content, 240) : null
  const articleChanges = article
    ? {
        id: article.id,
        slug: article.slug === legacyNewsSlug ? canonicalNewsSlug : article.slug,
        excerptChanged: article.excerpt !== nextExcerpt,
      }
    : null

  if (apply) {
    await prisma.$transaction(async (tx) => {
      for (const event of eventChanges) {
        await tx.event.update({
          where: { id: event.id },
          data: { title: event.normalizedTitle },
        })
      }

      if (article && articleChanges) {
        await tx.article.update({
          where: { id: article.id },
          data: {
            slug: articleChanges.slug,
            excerpt: nextExcerpt,
          },
        })
      }
    })
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'dry-run',
        eventsUpdated: eventChanges.length,
        eventChanges: eventChanges.map(({ id, title, normalizedTitle }) => ({
          id,
          before: title,
          after: normalizedTitle,
        })),
        article: articleChanges,
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
