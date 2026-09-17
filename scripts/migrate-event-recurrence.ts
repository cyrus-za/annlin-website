import { prisma } from '../lib/db'

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TYPE "RecurringPattern" ADD VALUE IF NOT EXISTS 'BIWEEKLY'`)
  await prisma.$executeRawUnsafe(`ALTER TYPE "RecurringPattern" ADD VALUE IF NOT EXISTS 'FIRST_WEEKDAY_MONTHLY'`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "recurrenceGroupId" TEXT`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "events_recurrenceGroupId_idx" ON "events"("recurrenceGroupId")`)

  const [summary] = await prisma.$queryRawUnsafe<Array<{ patterns: bigint; columns: bigint; indexes: bigint }>>(`
    SELECT
      (SELECT COUNT(*) FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'RecurringPattern' AND e.enumlabel IN ('BIWEEKLY', 'FIRST_WEEKDAY_MONTHLY')) AS patterns,
      (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_name = 'events' AND column_name = 'recurrenceGroupId') AS columns,
      (SELECT COUNT(*) FROM pg_indexes
        WHERE tablename = 'events' AND indexname = 'events_recurrenceGroupId_idx') AS indexes
  `)
  const result = {
    patterns: Number(summary?.patterns ?? 0),
    columns: Number(summary?.columns ?? 0),
    indexes: Number(summary?.indexes ?? 0),
  }
  console.log(JSON.stringify(result))
  if (result.patterns !== 2 || result.columns !== 1 || result.indexes !== 1) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Event recurrence migration failed')
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
