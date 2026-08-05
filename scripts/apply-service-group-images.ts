#!/usr/bin/env tsx

import { disconnectDatabase, prisma } from '../lib/db'
import { serviceGroupImages } from '../lib/service-group-images'

async function main() {
  const slugs = Object.keys(serviceGroupImages)
  const existing = await prisma.serviceGroup.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true },
  })
  const existingSlugs = new Set(existing.map((group) => group.slug))
  const missing = slugs.filter((slug) => !existingSlugs.has(slug))

  if (missing.length > 0) {
    throw new Error(`Diensgroepe ontbreek: ${missing.join(', ')}`)
  }

  const updates = await prisma.$transaction(
    Object.entries(serviceGroupImages).map(([slug, images]) =>
      prisma.serviceGroup.update({
        where: { slug },
        data: images,
        select: { slug: true },
      })
    )
  )

  console.log(`Diensgroepbeelde opgedateer: ${updates.length}`)
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Kon nie diensgroepbeelde opdateer nie.')
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
