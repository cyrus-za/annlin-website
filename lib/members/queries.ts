import type { MemberStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireMemberCapability } from './authorization'

function scopeWhere(scope: Awaited<ReturnType<typeof requireMemberCapability>>['scope']): Prisma.MemberWhereInput {
  if (scope.kind === 'GLOBAL') return {}
  return {
    OR: [
      { wardAssignments: { some: { endDate: null, wardId: { in: scope.wardIds } } } },
      {
        AND: [
          { wardAssignments: { none: { endDate: null } } },
          {
            householdHistory: {
              some: {
                endDate: null,
                household: { wardAssignments: { some: { endDate: null, wardId: { in: scope.wardIds } } } },
              },
            },
          },
        ],
      },
    ],
  }
}

export async function listMembers(
  userId: string,
  options: { search?: string; status?: MemberStatus; page?: number; pageSize?: number } = {},
) {
  const access = await requireMemberCapability(userId, 'MEMBER_READ')
  const page = Math.max(1, options.page ?? 1)
  const pageSize = Math.min(50, Math.max(10, options.pageSize ?? 25))
  const search = options.search?.trim()
  const where: Prisma.MemberWhereInput = {
    AND: [
      scopeWhere(access.scope),
      ...(options.status ? [{ status: options.status }] : []),
      ...(search ? [{
        OR: [
          { firstNames: { contains: search, mode: 'insensitive' as const } },
          { preferredName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }] : []),
    ],
  }

  const [members, total] = await prisma.$transaction([
    prisma.member.findMany({
      where,
      select: {
        id: true,
        firstNames: true,
        preferredName: true,
        lastName: true,
        status: true,
        archivedAt: true,
        householdHistory: {
          where: { endDate: null },
          select: { household: { select: { id: true, name: true } } },
          take: 1,
        },
        wardAssignments: {
          where: { endDate: null },
          select: { ward: { select: { id: true, code: true, name: true } } },
          take: 1,
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstNames: 'asc' }, { id: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.member.count({ where }),
  ])

  return { members, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}
