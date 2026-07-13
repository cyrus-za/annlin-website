#!/usr/bin/env tsx

import { Prisma } from '@prisma/client'
import { prisma } from '../lib/db'
import { CONTENT_PAGE_DEFINITIONS } from '../lib/content-page-definitions'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isLegacyPlaceholder(slug: string, sections: unknown): boolean {
  if (!isRecord(sections)) return false

  if (slug === 'tuis') {
    const hero = sections['hero']
    return isRecord(hero) && (
      hero['eyebrow'] === 'Gereformeerde Kerk Annlin' ||
      hero['title'] === 'Tot eer van God, tot opbou van die gemeente'
    )
  }

  return slug === 'oor-annlin-gemeente' && Array.isArray(sections['leadership'])
}

async function main() {
  let created = 0
  let existing = 0
  let normalized = 0

  for (const definition of CONTENT_PAGE_DEFINITIONS) {
    const page = await prisma.contentPage.findUnique({
      where: { slug: definition.slug },
      select: { id: true, sections: true },
    })

    if (page) {
      if (isLegacyPlaceholder(definition.slug, page.sections)) {
        await prisma.contentPage.update({
          where: { id: page.id },
          data: {
            title: definition.title,
            description: definition.description,
            sections: definition.sections as Prisma.InputJsonValue,
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
        })
        normalized += 1
        continue
      }

      existing += 1
      continue
    }

    await prisma.contentPage.create({
      data: {
        slug: definition.slug,
        title: definition.title,
        description: definition.description,
        sections: definition.sections as Prisma.InputJsonValue,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    })
    created += 1
  }

  console.log(JSON.stringify({ created, normalized, existing, total: CONTENT_PAGE_DEFINITIONS.length }))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
