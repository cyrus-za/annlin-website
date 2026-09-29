import { Prisma } from '@prisma/client'
import { prisma } from '../lib/db'
import { groupNames, groupSlugs, reviseGroupDescription, revisePageCopy } from './lib/magda-language'

const apply = process.argv.includes('--apply')
const marker = 'magda-language-20260929'

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

async function main() {
  const actor = await prisma.user.findUniqueOrThrow({ where: { email: 'pieter@venter.pro' }, select: { id: true } })
  const result = await prisma.$transaction(async (tx) => {
    const changes: { type: string; id: string }[] = []
    async function record(type: string, id: string, before: unknown, after: unknown) {
      changes.push({ type, id })
      if (!apply) return
      await tx.contentRevision.create({ data: { entityType: type, entityId: id, snapshot: json(before), createdBy: actor.id } })
      await tx.auditLog.create({ data: { userId: actor.id, action: 'UPDATE', entityType: type, entityId: id, changes: json({ reason: marker, before, after }) } })
    }

    const groups = await tx.serviceGroup.findMany({ where: { slug: { in: [...groupSlugs] } } })
    if (groups.length !== groupSlugs.length) throw new Error('Expected all eight reviewed service groups')
    for (const group of groups) {
      const description = reviseGroupDescription(group.slug, group.description ?? '')
      const name = groupNames[group.slug] ?? group.name
      if (description === group.description && name === group.name) continue
      await record('ServiceGroup', group.id, group, { name, description })
      if (apply) {
        const updated = await tx.serviceGroup.updateMany({ where: { id: group.id, updatedAt: group.updatedAt }, data: { name, description } })
        if (updated.count !== 1) throw new Error('Concurrent service group edit; retry after review')
      }
    }

    const pages = await tx.contentPage.findMany({ where: { slug: { in: ['tuis', 'oor-annlin-gemeente', 'kontak', 'kontakbesonderhede'] } } })
    for (const page of pages) {
      const sections = json(revisePageCopy(page.sections))
      const title = String(revisePageCopy(page.title))
      if (JSON.stringify(sections) === JSON.stringify(page.sections) && title === page.title) continue
      await record('ContentPage', page.id, page, { sections, title })
      if (apply) {
        const updated = await tx.contentPage.updateMany({ where: { id: page.id, updatedAt: page.updatedAt }, data: { sections, title } })
        if (updated.count !== 1) throw new Error('Concurrent page edit; retry after review')
      }
    }

    const publication = await tx.readingMaterial.findUniqueOrThrow({ where: { id: 'wp-publication-12479' } })
    const title = 'Verslae oor uitreike na Mosambiek'
    if (publication.title !== title) {
      if (publication.title !== 'Verslae oor uitreike na die buiteland') throw new Error('Publication title changed; review before applying')
      await record('ReadingMaterial', publication.id, publication, { title })
      if (apply) await tx.readingMaterial.update({ where: { id: publication.id }, data: { title } })
    }
    return changes
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 60000 })
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'dry-run', count: result.length, changes: result }, null, 2))
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Language update failed')
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
