import { MemberStatus, Prisma, type HouseholdRole, type MemberContactType, type MembershipEventType } from '@prisma/client'
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
  birthDate: Date | null
  status: MemberStatus
  version: number
}

export interface CreateMemberInput {
  firstNames: string
  preferredName?: string | null
  lastName: string
  birthDate: Date | null
  status: Exclude<MemberStatus, 'ARCHIVED'>
  wardId: string | null
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

export async function createMember(actorId: string, input: CreateMemberInput) {
  if (!isMemberPilotEnabled()) throw new MemberCommandError('NOT_FOUND', 'Lidmaatregister nie beskikbaar nie')
  if (!Object.values(MemberStatus).includes(input.status) || input.status === 'ARCHIVED') {
    throw new MemberCommandError('INVALID', 'Ongeldige lidmaatstatus')
  }

  const normalized = {
    firstNames: cleanRequired(input.firstNames, 'Voorname'),
    preferredName: cleanOptional(input.preferredName),
    lastName: cleanRequired(input.lastName, 'Van'),
    birthDate: input.birthDate,
    status: input.status,
  }

  return prisma.$transaction(async (tx) => {
    const access = await requireMemberCapability(actorId, 'MEMBER_WRITE', tx)
    const actor = await tx.user.findUnique({
      where: { id: actorId },
      select: { id: true, name: true, role: true, disabledAt: true },
    })
    if (!actor || actor.disabledAt) throw new MemberCommandError('NOT_FOUND', 'Lidmaatregister nie beskikbaar nie')

    if (access.scope.kind === 'WARDS' && !input.wardId) {
      throw new MemberCommandError('INVALID', 'Kies ’n wyk vir die nuwe lidmaat')
    }
    const ward = input.wardId
      ? await tx.ward.findFirst({
          where: {
            AND: [
              { id: input.wardId },
              ...(access.scope.kind === 'WARDS' ? [{ id: { in: access.scope.wardIds } }] : []),
            ],
            activeFrom: { lte: new Date() },
            OR: [{ activeTo: null }, { activeTo: { gte: new Date() } }],
          },
          select: { id: true, code: true, name: true },
        })
      : null
    if (input.wardId && !ward) throw new MemberCommandError('NOT_FOUND', 'Gekose wyk nie beskikbaar nie')

    const member = await tx.member.create({
      data: {
        ...normalized,
        wardAssignments: ward
          ? { create: { wardId: ward.id, startDate: new Date() } }
          : undefined,
      },
    })
    await tx.memberAuditEvent.create({
      data: {
        entityType: 'Member',
        entityId: member.id,
        action: 'CREATE',
        actorId: actor.id,
        actorNameSnapshot: actor.name,
        actorRoleSnapshot: actor.role,
        source: 'ADMIN',
        changes: {
          after: {
            firstNames: member.firstNames,
            preferredName: member.preferredName,
            lastName: member.lastName,
            birthDate: member.birthDate?.toISOString().slice(0, 10) ?? null,
            status: member.status,
            ward: ward ? `${ward.code}: ${ward.name}` : null,
          },
        },
      },
    })
    return member
  }, { isolationLevel: 'Serializable' })
}

type MemberMutationTx = Prisma.TransactionClient

async function writableMember(tx: MemberMutationTx, actorId: string, memberId: string, version: number) {
  const access = await requireMemberCapability(actorId, 'MEMBER_WRITE', tx)
  const [actor, member] = await Promise.all([
    tx.user.findUnique({ where: { id: actorId }, select: { id: true, name: true, role: true, disabledAt: true } }),
    tx.member.findFirst({ where: memberScopeWhere(memberId, access.scope) }),
  ])
  if (!actor || actor.disabledAt || !member) throw new MemberCommandError('NOT_FOUND', 'Lidmaat nie gevind nie')
  if (member.version !== version) throw new MemberCommandError('CONFLICT', 'Iemand het hierdie rekord intussen verander')
  return { access, actor, member }
}

async function incrementMemberVersion(tx: MemberMutationTx, memberId: string, version: number) {
  const changed = await tx.member.updateMany({ where: { id: memberId, version }, data: { version: { increment: 1 } } })
  if (changed.count !== 1) throw new MemberCommandError('CONFLICT', 'Iemand het hierdie rekord intussen verander')
}

async function relatedAudit(tx: MemberMutationTx, actor: Awaited<ReturnType<typeof writableMember>>['actor'], memberId: string, action: string, changes: Prisma.InputJsonValue) {
  await tx.memberAuditEvent.create({
    data: { entityType: 'Member', entityId: memberId, action, actorId: actor.id, actorNameSnapshot: actor.name, actorRoleSnapshot: actor.role, source: 'ADMIN', changes },
  })
}

export async function setMemberWard(actorId: string, input: { memberId: string; version: number; wardId: string | null; startDate: Date }) {
  return prisma.$transaction(async (tx) => {
    const { access, actor } = await writableMember(tx, actorId, input.memberId, input.version)
    if (access.scope.kind === 'WARDS' && !input.wardId) throw new MemberCommandError('INVALID', '’n Wyk is vir hierdie toegang verpligtend')
    const ward = input.wardId ? await tx.ward.findFirst({
      where: { AND: [{ id: input.wardId }, ...(access.scope.kind === 'WARDS' ? [{ id: { in: access.scope.wardIds } }] : [])] },
      select: { id: true, code: true, name: true },
    }) : null
    if (input.wardId && !ward) throw new MemberCommandError('NOT_FOUND', 'Wyk nie beskikbaar nie')
    const current = await tx.wardAssignment.findFirst({ where: { memberId: input.memberId, endDate: null }, include: { ward: { select: { code: true, name: true } } } })
    await incrementMemberVersion(tx, input.memberId, input.version)
    if (current) await tx.wardAssignment.update({ where: { id: current.id }, data: { endDate: input.startDate } })
    if (ward) await tx.wardAssignment.create({ data: { memberId: input.memberId, wardId: ward.id, startDate: input.startDate } })
    await relatedAudit(tx, actor, input.memberId, 'WARD_UPDATE', { before: { ward: current ? `${current.ward.code}: ${current.ward.name}` : null }, after: { ward: ward ? `${ward.code}: ${ward.name}` : null } })
  }, { isolationLevel: 'Serializable' })
}

export async function setMemberHousehold(actorId: string, input: { memberId: string; version: number; householdId: string | null; newHouseholdName: string | null; role: HouseholdRole; isHead: boolean; startDate: Date }) {
  return prisma.$transaction(async (tx) => {
    const { access, actor } = await writableMember(tx, actorId, input.memberId, input.version)
    let household = input.householdId ? await tx.household.findFirst({
      where: {
        id: input.householdId,
        archivedAt: null,
        ...(access.scope.kind === 'WARDS' ? { wardAssignments: { some: { endDate: null, wardId: { in: access.scope.wardIds } } } } : {}),
      },
      select: { id: true, name: true },
    }) : null
    if (input.householdId && !household) throw new MemberCommandError('NOT_FOUND', 'Huishouding nie beskikbaar nie')
    if (input.newHouseholdName) {
      if (access.scope.kind === 'WARDS') throw new MemberCommandError('INVALID', 'Skep die huishouding eers binne ’n toegelate wyk')
      household = await tx.household.create({ data: { name: input.newHouseholdName }, select: { id: true, name: true } })
    }
    if (access.scope.kind === 'WARDS' && !household) throw new MemberCommandError('INVALID', 'Kies ’n huishouding binne jou toegelate wyke')
    const current = await tx.householdMember.findFirst({ where: { memberId: input.memberId, endDate: null }, include: { household: { select: { name: true } } } })
    await incrementMemberVersion(tx, input.memberId, input.version)
    if (current) await tx.householdMember.update({ where: { id: current.id }, data: { endDate: input.startDate } })
    if (household) await tx.householdMember.create({ data: { memberId: input.memberId, householdId: household.id, role: input.role, isHead: input.isHead, startDate: input.startDate } })
    await relatedAudit(tx, actor, input.memberId, 'HOUSEHOLD_UPDATE', { before: { household: current?.household.name ?? null }, after: { household: household?.name ?? null } })
  }, { isolationLevel: 'Serializable' })
}

function normalizedContact(type: MemberContactType, value: string) {
  if (type === 'EMAIL') return value.trim().toLowerCase()
  if (type === 'MOBILE' || type === 'PHONE' || type === 'WHATSAPP') return value.replace(/[^\d+]/g, '')
  return value.trim().toLowerCase()
}

export async function saveMemberContact(actorId: string, input: { memberId: string; version: number; contactId: string | null; type: MemberContactType; value: string; isPreferred: boolean; isVerified: boolean }) {
  return prisma.$transaction(async (tx) => {
    const { actor } = await writableMember(tx, actorId, input.memberId, input.version)
    const current = input.contactId ? await tx.memberContactPoint.findFirst({ where: { id: input.contactId, memberId: input.memberId, endDate: null } }) : null
    if (input.contactId && !current) throw new MemberCommandError('NOT_FOUND', 'Kontakpunt nie beskikbaar nie')
    await incrementMemberVersion(tx, input.memberId, input.version)
    if (input.isPreferred) await tx.memberContactPoint.updateMany({ where: { memberId: input.memberId, endDate: null }, data: { isPreferred: false } })
    const data = { type: input.type, value: input.value, normalizedValue: normalizedContact(input.type, input.value), isPreferred: input.isPreferred, verifiedAt: input.isVerified ? (current?.verifiedAt ?? new Date()) : null }
    const saved = current
      ? await tx.memberContactPoint.update({ where: { id: current.id }, data })
      : await tx.memberContactPoint.create({ data: { ...data, memberId: input.memberId, startDate: new Date() } })
    await relatedAudit(tx, actor, input.memberId, current ? 'CONTACT_UPDATE' : 'CONTACT_ADD', { before: current ? { type: current.type, value: current.value, isPreferred: current.isPreferred, isVerified: Boolean(current.verifiedAt) } : {}, after: { type: saved.type, value: saved.value, isPreferred: saved.isPreferred, isVerified: Boolean(saved.verifiedAt) } })
  }, { isolationLevel: 'Serializable' })
}

export async function endMemberContact(actorId: string, input: { memberId: string; version: number; contactId: string }) {
  return prisma.$transaction(async (tx) => {
    const { actor } = await writableMember(tx, actorId, input.memberId, input.version)
    const current = await tx.memberContactPoint.findFirst({ where: { id: input.contactId, memberId: input.memberId, endDate: null } })
    if (!current) throw new MemberCommandError('NOT_FOUND', 'Kontakpunt nie beskikbaar nie')
    await incrementMemberVersion(tx, input.memberId, input.version)
    await tx.memberContactPoint.update({ where: { id: current.id }, data: { endDate: new Date(), isPreferred: false } })
    await relatedAudit(tx, actor, input.memberId, 'CONTACT_END', { before: { type: current.type, value: current.value, isPreferred: current.isPreferred }, after: { ended: true } })
  }, { isolationLevel: 'Serializable' })
}

export async function addMembershipEvent(actorId: string, input: { memberId: string; version: number; type: MembershipEventType; effectiveDate: Date; note: string | null }) {
  return prisma.$transaction(async (tx) => {
    const { actor } = await writableMember(tx, actorId, input.memberId, input.version)
    await incrementMemberVersion(tx, input.memberId, input.version)
    const event = await tx.membershipEvent.create({ data: { memberId: input.memberId, type: input.type, effectiveDate: input.effectiveDate, source: 'ADMIN', details: input.note ? { note: input.note } : undefined } })
    await relatedAudit(tx, actor, input.memberId, 'EVENT_ADD', { after: { eventId: event.id, type: event.type, effectiveDate: event.effectiveDate.toISOString().slice(0, 10) } })
  }, { isolationLevel: 'Serializable' })
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
    birthDate: input.birthDate,
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
      if (
        current.firstNames === normalized.firstNames &&
        current.preferredName === normalized.preferredName &&
        current.lastName === normalized.lastName &&
        current.birthDate?.toISOString().slice(0, 10) === normalized.birthDate?.toISOString().slice(0, 10) &&
        current.status === normalized.status
      ) {
        return current
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
              birthDate: current.birthDate?.toISOString().slice(0, 10) ?? null,
              status: current.status,
              version: current.version,
            },
            after: {
              firstNames: updated.firstNames,
              preferredName: updated.preferredName,
              lastName: updated.lastName,
              birthDate: updated.birthDate?.toISOString().slice(0, 10) ?? null,
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
