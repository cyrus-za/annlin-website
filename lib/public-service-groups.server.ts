import type { PublicServiceGroup } from '@/components/public/ServiceGroups'
import { prisma } from '@/lib/db'

export async function getPublicServiceGroups(limit = 100): Promise<PublicServiceGroup[]> {
  const groups = await prisma.serviceGroup.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      contactPerson: true,
      contactEmail: true,
      contactPhone: true,
      thumbnailUrl: true,
      bannerUrl: true,
      isActive: true,
    },
  })

  return groups.map((group) => ({
    ...group,
    contactPhone: group.contactPhone ?? undefined,
    thumbnailUrl: group.thumbnailUrl ?? undefined,
    bannerUrl: group.bannerUrl ?? undefined,
  }))
}
