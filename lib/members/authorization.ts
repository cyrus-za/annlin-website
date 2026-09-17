import type { MemberCapability, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

export class MemberAuthorizationError extends Error {
  constructor() {
    super('Lidmaatproef is nie beskikbaar nie')
    this.name = 'MemberAuthorizationError'
  }
}

export function isMemberPilotEnabled() {
  return process.env['MEMBER_PILOT_ENABLED'] === 'true'
}

type MemberAuthorizationDb = Pick<Prisma.TransactionClient, 'user'>

export async function requireMemberCapability(
  userId: string,
  capability: MemberCapability,
  db: MemberAuthorizationDb = prisma,
) {
  if (!isMemberPilotEnabled()) throw new MemberAuthorizationError()

  const now = new Date()
  const user = await db.user.findFirst({
    where: {
      id: userId,
      disabledAt: null,
      memberPilotAccess: {
        is: { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      },
      memberCapabilityGrants: {
        some: {
          capability,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      },
    },
    select: {
      id: true,
      memberCapabilityGrants: {
        where: {
          capability,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        select: { scope: true },
        take: 1,
      },
      memberWardScopes: {
        where: { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        select: { wardId: true },
      },
    },
  })

  if (!user) throw new MemberAuthorizationError()
  const grant = user.memberCapabilityGrants[0]
  if (!grant) throw new MemberAuthorizationError()
  if (grant.scope === 'WARDS' && user.memberWardScopes.length === 0) {
    throw new MemberAuthorizationError()
  }

  return {
    userId: user.id,
    capability,
    scope: grant.scope === 'GLOBAL'
      ? { kind: 'GLOBAL' as const }
      : { kind: 'WARDS' as const, wardIds: user.memberWardScopes.map(({ wardId }) => wardId) },
  }
}
