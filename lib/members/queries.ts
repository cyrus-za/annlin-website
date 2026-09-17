import type { MemberCapability, MemberStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { MemberAuthorizationError, requireMemberCapability } from './authorization'
import {
  MEMBER_DETAIL_VIEW_ACTION,
  type MemberDetail,
  VIEW_AUDIT_ACTIONS,
  buildMemberDetailViewAudit,
  summarizeMemberAuditChanges,
  summarizeMembershipEventDetails,
} from './detail-view'

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

const personSelect = {
  id: true,
  firstNames: true,
  preferredName: true,
  lastName: true,
  status: true,
} satisfies Prisma.MemberSelect

const currentWardSelect = {
  where: { endDate: null },
  select: { startDate: true, ward: { select: { id: true, code: true, name: true } } },
  orderBy: { startDate: 'desc' },
  take: 1,
} satisfies Prisma.Member$wardAssignmentsArgs

/** True when the capability check passes; only authorization failures are swallowed. */
async function hasMemberCapability(db: Prisma.TransactionClient, userId: string, capability: MemberCapability) {
  try {
    await requireMemberCapability(userId, capability, db)
    return true
  } catch (error) {
    if (error instanceof MemberAuthorizationError) return false
    throw error
  }
}

/**
 * Loads one member for the read-only detail view.
 *
 * Returns `null` for unknown IDs and for records outside the caller's ward scope so that the two
 * cases are indistinguishable. Throws `MemberAuthorizationError` when the caller has no pilot
 * access at all, exactly like `listMembers`.
 *
 * The read, the capability checks and the VIEW_DETAIL audit event share one transaction: a revoked
 * or disabled user can neither complete the read nor leave an apparently successful view event, and
 * no view event is written for a missing or out-of-scope record. Record history is only queried
 * when the caller holds MEMBER_AUDIT_READ.
 */
export async function getMemberDetail(userId: string, memberId: string): Promise<MemberDetail | null> {
  return prisma.$transaction(async (tx): Promise<MemberDetail | null> => {
    const access = await requireMemberCapability(userId, 'MEMBER_READ', tx)
    const actor = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true, disabledAt: true },
    })
    if (!actor || actor.disabledAt) throw new MemberAuthorizationError()
    const scope = scopeWhere(access.scope)

    const member = await tx.member.findFirst({
      where: { AND: [{ id: memberId }, scope] },
      select: {
        ...personSelect,
        archivedAt: true,
        updatedAt: true,
        wardAssignments: currentWardSelect,
        householdHistory: {
          where: { endDate: null },
          orderBy: { startDate: 'desc' },
          take: 1,
          select: {
            startDate: true,
            role: true,
            isHead: true,
            household: {
              select: {
                id: true,
                name: true,
                archivedAt: true,
                wardAssignments: currentWardSelect,
                memberHistory: {
                  // Other household members are only listed when they fall inside the caller's own scope.
                  where: { endDate: null, member: scope },
                  orderBy: [{ isHead: 'desc' }, { startDate: 'asc' }],
                  take: 50,
                  select: { role: true, isHead: true, startDate: true, member: { select: personSelect } },
                },
              },
            },
          },
        },
        contacts: {
          where: { endDate: null },
          orderBy: [{ isPreferred: 'desc' }, { type: 'asc' }, { startDate: 'desc' }],
          take: 20,
          select: { id: true, type: true, value: true, isPreferred: true, verifiedAt: true, startDate: true },
        },
        events: {
          orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
          take: 100,
          select: { id: true, type: true, effectiveDate: true, details: true },
        },
      },
    })
    if (!member) return null

    const historyAvailable = await hasMemberCapability(tx, userId, 'MEMBER_AUDIT_READ')
    const auditEvents = historyAvailable
      ? await tx.memberAuditEvent.findMany({
          where: { entityType: 'Member', entityId: member.id, action: { notIn: [...VIEW_AUDIT_ACTIONS] } },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: { id: true, action: true, actorNameSnapshot: true, createdAt: true, changes: true },
        })
      : []

    await tx.memberAuditEvent.create({
      data: {
        entityType: 'Member',
        entityId: member.id,
        action: MEMBER_DETAIL_VIEW_ACTION,
        actorId: actor.id,
        actorNameSnapshot: actor.name,
        actorRoleSnapshot: actor.role,
        source: 'ADMIN',
        changes: buildMemberDetailViewAudit({ scopeKind: access.scope.kind, historyIncluded: historyAvailable }),
      },
    })

    const membership = member.householdHistory[0] ?? null
    const householdWard = membership?.household.wardAssignments[0] ?? null
    const individualWard = member.wardAssignments[0] ?? null
    const effective = individualWard ?? householdWard

    return {
      id: member.id,
      firstNames: member.firstNames,
      preferredName: member.preferredName,
      lastName: member.lastName,
      status: member.status,
      archivedAt: member.archivedAt,
      updatedAt: member.updatedAt,
      scopeKind: access.scope.kind,
      historyAvailable,
      household: membership
        ? {
            id: membership.household.id,
            name: membership.household.name,
            archivedAt: membership.household.archivedAt,
            since: membership.startDate,
            role: membership.role,
            isHead: membership.isHead,
            members: membership.household.memberHistory.map((entry) => ({
              ...entry.member,
              role: entry.role,
              isHead: entry.isHead,
              since: entry.startDate,
            })),
          }
        : null,
      ward: effective
        ? {
            id: effective.ward.id,
            code: effective.ward.code,
            name: effective.ward.name,
            since: effective.startDate,
            source: individualWard ? 'INDIVIDUAL' : 'HOUSEHOLD',
            overriddenHouseholdWard:
              individualWard && householdWard && householdWard.ward.id !== individualWard.ward.id
                ? { code: householdWard.ward.code, name: householdWard.ward.name }
                : null,
          }
        : null,
      contacts: member.contacts.map(({ startDate, ...contact }) => ({ ...contact, since: startDate })),
      events: member.events.map(({ details, ...event }) => ({ ...event, ...summarizeMembershipEventDetails(details) })),
      history: auditEvents.map((event) => ({
        id: event.id,
        action: event.action,
        actorName: event.actorNameSnapshot,
        createdAt: event.createdAt,
        fields: summarizeMemberAuditChanges(event.changes),
      })),
    }
  })
}
