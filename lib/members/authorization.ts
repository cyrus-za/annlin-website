import type { MemberCapability } from '@prisma/client'
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

export async function requireMemberCapability(userId: string, capability: MemberCapability) {
  if (!isMemberPilotEnabled()) throw new MemberAuthorizationError()

  const now = new Date()
  const user = await prisma.user.findFirst({
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
    select: { id: true },
  })

  if (!user) throw new MemberAuthorizationError()
  return { userId: user.id, capability }
}
