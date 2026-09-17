import { execFileSync } from 'node:child_process'
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

  await prisma.changelogEntry.upsert({
    where: { commitSha },
    create: { commitSha, title, description, category, publishedAt },
    update: { title, description, category, publishedAt },
  })

  console.log(`Veranderingslogboek opgedateer vir ${commitSha.slice(0, 7)}.`)
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Kon nie die veranderingslogboek opdateer nie.')
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
