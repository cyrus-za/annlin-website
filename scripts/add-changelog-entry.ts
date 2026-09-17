import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/db'

function argument(name: string): string | undefined {
  const prefix = `--${name}=`
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length)
}

function currentCommit(): string {
  return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
}

async function main() {
  const title = argument('title')?.trim()
  const description = argument('description')?.trim()
  const category = argument('category')?.trim()
  const commitSha = argument('commit')?.trim() || currentCommit()
  const publishedAtValue = argument('published-at')?.trim()

  if (!title || !description || !category) {
    throw new Error('Gebruik --title=..., --description=... en --category=...')
  }

  const publishedAt = publishedAtValue ? new Date(publishedAtValue) : new Date()
  if (Number.isNaN(publishedAt.getTime())) throw new Error('Ongeldige --published-at datum')

  const titleHash = createHash('sha256').update(title).digest('hex').slice(0, 12)
  const id = `changelog-${commitSha.slice(0, 12)}-${titleHash}`
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "changelog_entries"
      ("id", "commitSha", "title", "description", "category", "publishedAt", "createdAt")
    VALUES
      (${id}, ${commitSha}, ${title}, ${description}, ${category}, ${publishedAt}, CURRENT_TIMESTAMP)
    ON CONFLICT ("commitSha", "title") DO UPDATE SET
      "description" = EXCLUDED."description",
      "category" = EXCLUDED."category",
      "publishedAt" = EXCLUDED."publishedAt"
  `)

  console.log(`Veranderingslogboek opgedateer vir ${commitSha.slice(0, 7)}.`)
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Kon nie die veranderingslogboek opdateer nie.')
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
