import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { prisma } from '../lib/db'
import { groupNames, groupSlugs, reviseGroupDescription, revisePageCopy } from './lib/magda-language'

async function main() {
  const path = process.argv.find((arg) => arg.startsWith('--snapshot='))?.slice('--snapshot='.length)
  if (!path) throw new Error('Supply the private pre-change snapshot with --snapshot=...')
  const snapshot = JSON.parse(readFileSync(path, 'utf8')) as {
    groups: { id: string; slug: string; name: string; description: string; updatedAt: string }[]
    pages: { id: string; slug: string; title: string; sections: unknown; updatedAt: string }[]
  }
  for (const slug of groupSlugs) {
    const before = snapshot.groups.find((group) => group.slug === slug)
    assert.ok(before)
    const after = JSON.parse(JSON.stringify(await prisma.serviceGroup.findUniqueOrThrow({ where: { id: before.id } })))
    assert.deepEqual({ ...after, updatedAt: before.updatedAt }, {
      ...before, name: groupNames[slug] ?? before.name, description: reviseGroupDescription(slug, before.description),
    }, `Unexpected field change: ${slug}`)
  }
  let pages = 0
  for (const before of snapshot.pages.filter((page) => ['tuis', 'oor-annlin-gemeente', 'kontak', 'kontakbesonderhede'].includes(page.slug))) {
    const after = JSON.parse(JSON.stringify(await prisma.contentPage.findUniqueOrThrow({ where: { id: before.id } })))
    assert.deepEqual({ ...after, updatedAt: before.updatedAt }, {
      ...before, title: revisePageCopy(before.title), sections: revisePageCopy(before.sections),
    }, `Unexpected page change: ${before.slug}`)
    pages++
  }
  const publication = await prisma.readingMaterial.findUniqueOrThrow({ where: { id: 'wp-publication-12479' }, select: { title: true } })
  assert.equal(publication.title, 'Verslae oor uitreike na Mosambiek')
  console.log(JSON.stringify({ status: 'ok', groups: groupSlugs.length, pages, publications: 1, unrelatedFieldsPreserved: true }))
}

main().catch((error: unknown) => {
  // Assertion payloads can contain contact details; report only the failure label.
  console.error(error instanceof assert.AssertionError ? error.message.split('\n')[0] : 'Verification failed')
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
