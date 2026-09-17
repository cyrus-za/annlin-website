import { MemberStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { isMemberPilotEnabled, requireMemberCapability } from './authorization'

export class MemberCommandError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'INVALID' | 'CONFLICT',
    message: string,
  ) {
    super(message)
    this.name = 'MemberCommandError'
  }
}

export interface UpdateMemberInput {
  firstNames: string
  preferredName?: string | null
  lastName: string
  status: MemberStatus
  version: number
}

function cleanRequired(value: string, label: string) {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (!cleaned || cleaned.length > 120) throw new MemberCommandError('INVALID', `${label} is ongeldig`)
  return cleaned
}

function cleanOptional(value?: string | null) {
  const cleaned = value?.trim().replace(/\s+/g, ' ') || null
  if (cleaned && cleaned.length > 120) throw new MemberCommandError('INVALID', 'Noemnaam is te lank')
  return cleaned
}

function memberScopeWhere(
  id: string,
  scope: Awaited<ReturnType<typeof requireMemberCapability>>['scope'],
): Prisma.MemberWhereInput {
  if (scope.kind === 'GLOBAL') return { id }
  return {
    id,
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

export async function updateMember(actorId: string, memberId: string, input: UpdateMemberInput) {
  if (!isMemberPilotEnabled()) throw new MemberCommandError('NOT_FOUND', 'Lidmaat nie gevind nie')
  if (!Number.isInteger(input.version) || input.version < 1) {
    throw new MemberCommandError('INVALID', 'Ongeldige rekordweergawe')
  }
  if (!Object.values(MemberStatus).includes(input.status)) {
    throw new MemberCommandError('INVALID', 'Ongeldige lidmaatstatus')
  }

  const normalized = {
    firstNames: cleanRequired(input.firstNames, 'Voorname'),
    preferredName: cleanOptional(input.preferredName),
    lastName: cleanRequired(input.lastName, 'Van'),
    status: input.status,
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Re-evaluate access inside the write transaction so revocation cannot race the mutation.
      const access = await requireMemberCapability(actorId, 'MEMBER_WRITE', tx)
      const [actor, current] = await Promise.all([
        tx.user.findUnique({ where: { id: actorId }, select: { id: true, name: true, role: true, disabledAt: true } }),
        tx.member.findFirst({ where: memberScopeWhere(memberId, access.scope) }),
      ])
      if (!actor || actor.disabledAt || !current) throw new MemberCommandError('NOT_FOUND', 'Lidmaat nie gevind nie')
      if (current.version !== input.version) {
        throw new MemberCommandError('CONFLICT', 'Iemand het hierdie rekord intussen verander')
      }

      const changed = await tx.member.updateMany({
        where: { id: memberId, version: input.version },
        data: { ...normalized, version: { increment: 1 } },
      })
      if (changed.count !== 1) throw new MemberCommandError('CONFLICT', 'Iemand het hierdie rekord intussen verander')

      const updated = await tx.member.findUniqueOrThrow({ where: { id: memberId } })
      if (current.status !== updated.status) {
        await tx.membershipEvent.create({
          data: {
            memberId,
            type: 'STATUS_CHANGED',
            effectiveDate: new Date(),
            source: 'ADMIN',
            details: { before: current.status, after: updated.status },
          },
        })
      }
      await tx.memberAuditEvent.create({
        data: {
          entityType: 'Member',
          entityId: memberId,
          action: 'UPDATE',
          actorId: actor.id,
          actorNameSnapshot: actor.name,
          actorRoleSnapshot: actor.role,
          source: 'ADMIN',
          changes: {
            before: {
              firstNames: current.firstNames,
              preferredName: current.preferredName,
              lastName: current.lastName,
              status: current.status,
              version: current.version,
            },
            after: {
              firstNames: updated.firstNames,
              preferredName: updated.preferredName,
              lastName: updated.lastName,
              status: updated.status,
              version: updated.version,
            },
          },
        },
      })
      return updated
    }, { isolationLevel: 'Serializable' })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      throw new MemberCommandError('CONFLICT', 'Iemand het hierdie rekord intussen verander')
    }
    throw error
  }
}
