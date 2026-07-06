#!/usr/bin/env tsx

import { disconnectDatabase, prisma } from '../lib/db'
import { createArticleExcerpt, normalizeArticleContent } from '../lib/public-content'

async function main() {
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  })

  const updated: Array<{ id: string; title: string }> = []

  for (const article of articles) {
    const content = normalizeArticleContent(article.content)
    const excerpt = createArticleExcerpt(content, 240)

    if (content === article.content && excerpt === article.excerpt) {
      continue
    }

    await prisma.article.update({
      where: { id: article.id },
      data: {
        content,
        excerpt,
      },
    })

    updated.push({ id: article.id, title: article.title })
  }

  console.log(
    JSON.stringify(
      {
        scanned: articles.length,
        updated: updated.length,
        articles: updated,
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
