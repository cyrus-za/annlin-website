import { Prisma } from '@prisma/client'
import { prisma } from '../lib/db'

const COMMIT_SHA = 'bf877fb'
const COMBINED_TITLE = 'Meer buigsame jaarprogram en WhatsApp-kontak'

async function main() {
  await prisma.$transaction([
    prisma.$executeRawUnsafe('DROP INDEX IF EXISTS "changelog_entries_commitSha_key"'),
    prisma.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS "changelog_entries_commitSha_title_key" ON "changelog_entries"("commitSha", "title")',
    ),
  ])

  const [existing] = await prisma.$queryRaw<Array<{
    id: string
    category: string
    publishedAt: Date
    createdAt: Date
  }>>(Prisma.sql`
    SELECT "id", "category", "publishedAt", "createdAt"
    FROM "changelog_entries"
    WHERE "commitSha" = ${COMMIT_SHA} AND "title" = ${COMBINED_TITLE}
    LIMIT 1
  `)

  if (existing) {
    await prisma.$transaction([
      prisma.$executeRaw(Prisma.sql`
        UPDATE "changelog_entries"
        SET
          "title" = ${'Meer buigsame jaarprogram'},
          "description" = ${'Herhalende gebeure kan nou elke tweede week of op die eerste gekose weeksdag van die maand geskep word, met ’n einddatum en maklike verwydering van die hele reeks.'}
        WHERE "id" = ${existing.id}
      `),
      prisma.$executeRaw(Prisma.sql`
        INSERT INTO "changelog_entries"
          ("id", "commitSha", "title", "description", "category", "publishedAt", "createdAt")
        VALUES
          (
            ${'changelog-bf877fb854fc-whatsapp'},
            ${COMMIT_SHA},
            ${'WhatsApp-kontak'},
            ${'Die kerkkantoor se selfoonnommer is nou op die kontakblad, voetskrif en diensgroep-oproepe beskikbaar met ’n direkte WhatsApp-skakel.'},
            ${existing.category},
            ${existing.publishedAt},
            ${existing.createdAt}
          )
        ON CONFLICT ("commitSha", "title") DO UPDATE SET
          "description" = EXCLUDED."description",
          "category" = EXCLUDED."category",
          "publishedAt" = EXCLUDED."publishedAt"
      `),
    ])
  }

  const entries = await prisma.$queryRaw<Array<{ title: string }>>(Prisma.sql`
    SELECT "title"
    FROM "changelog_entries"
    WHERE "commitSha" = ${COMMIT_SHA}
    ORDER BY "title" ASC
  `)
  const titles = entries.map(({ title }) => title)
  const expected = ['Meer buigsame jaarprogram', 'WhatsApp-kontak']
  if (titles.length !== expected.length || titles.some((title, index) => title !== expected[index])) {
    throw new Error('Die logboekinskrywing kon nie korrek verdeel word nie')
  }

  const [index] = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS count
    FROM pg_indexes
    WHERE tablename = 'changelog_entries'
      AND indexname = 'changelog_entries_commitSha_title_key'
  `)
  console.log(JSON.stringify({ entries: entries.length, compoundIndex: Number(index?.count ?? 0) }))
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Logboekmigrasie het misluk')
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
