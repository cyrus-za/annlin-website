#!/usr/bin/env tsx

import { prisma } from '../lib/db'

const RETIRED_IDS = ['wp-page-1807']

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run')
  if (apply === dryRun) throw new Error('Choose exactly one mode: --dry-run or --apply.')

  const records = await prisma.readingMaterial.findMany({
    where: { id: { in: RETIRED_IDS } },
    select: { id: true, title: true, isArchived: true },
  })
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', records }))

  if (apply) {
    await prisma.readingMaterial.updateMany({ where: { id: { in: RETIRED_IDS } }, data: { isArchived: true } })
    const remaining = await prisma.readingMaterial.count({ where: { id: { in: RETIRED_IDS }, isArchived: false } })
    console.log(JSON.stringify({ archived: records.length, remaining }))
    if (remaining !== 0) process.exitCode = 1
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Reading-content cleanup failed.')
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
