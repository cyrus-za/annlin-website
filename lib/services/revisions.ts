import { prisma } from '@/lib/db'

export async function createContentRevision({
  entityType,
  entityId,
  snapshot,
  createdBy,
}: {
  entityType: string
  entityId: string
  snapshot: unknown
  createdBy: string
}) {
  return prisma.contentRevision.create({
    data: {
      entityType,
      entityId,
      snapshot: snapshot as object,
      createdBy,
    },
  })
}
