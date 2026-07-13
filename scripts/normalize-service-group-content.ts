#!/usr/bin/env tsx

import { disconnectDatabase, prisma } from '../lib/db'
import { normalizeServiceGroupContent } from '../lib/public-content'

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const groups = await prisma.serviceGroup.findMany({ orderBy: { displayOrder: 'asc' } })
  const changes = groups
    .map((group) => ({
      id: group.id,
      slug: group.slug,
      before: group.description,
      after: normalizeServiceGroupContent(group.description, group.name),
    }))
    .filter((group) => group.before !== group.after)

  if (!dryRun) {
    for (const change of changes) {
      await prisma.serviceGroup.update({
        where: { id: change.id },
        data: { description: change.after },
      })
    }
  }

  console.log(
    JSON.stringify(
      {
        total: groups.length,
        changed: changes.length,
        dryRun,
        groups: changes.map((change) => ({
          slug: change.slug,
          beforeLength: change.before.length,
          afterLength: change.after.length,
          preview: change.after.slice(0, 160),
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
