import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireMemberCapability } from './authorization'
import { memberScopeWhere } from './queries'

export class WardCommandError extends Error {
  constructor(public code: 'NOT_FOUND' | 'INVALID' | 'CONFLICT', message: string) {
    super(message)
    this.name = 'WardCommandError'
  }
}

type WardInput = {
  code: string
  name: string
  activeFrom: Date
  elderId: string | null
  elderStartDate: Date
}

function normalizeWardInput(input: WardInput): WardInput {
  const code = input.code.trim().replace(/\s+/g, ' ')
  const name = input.name.trim().replace(/\s+/g, ' ')
  if (!code || code.length > 30) throw new WardCommandError('INVALID', 'Ongeldige wykkode')
  if (!name || name.length > 120) throw new WardCommandError('INVALID', 'Ongeldige wyknaam')
  if (Number.isNaN(input.activeFrom.getTime()) || Number.isNaN(input.elderStartDate.getTime())) throw new WardCommandError('INVALID', 'Ongeldige datum')
  if (input.elderId && input.elderStartDate < input.activeFrom) throw new WardCommandError('INVALID', 'Die ouderling se dienstyd kan nie voor die wyk se begindatum begin nie.')
  return { ...input, code, name }
}

function wardWhere(scope: Awaited<ReturnType<typeof requireMemberCapability>>['scope']): Prisma.WardWhereInput {
  return scope.kind === 'GLOBAL' ? {} : { id: { in: scope.wardIds } }
}

function displayName(member: { firstNames: string; preferredName: string | null; lastName: string }) {
  return `${member.preferredName || member.firstNames} ${member.lastName}`
}

export async function listWardManagement(userId: string) {
  const [writeAccess, readAccess] = await Promise.all([
    requireMemberCapability(userId, 'WARD_WRITE'),
    requireMemberCapability(userId, 'MEMBER_READ'),
  ])
  const [wards, members] = await Promise.all([
    prisma.ward.findMany({
      where: { AND: [wardWhere(writeAccess.scope), { activeTo: null }] },
      select: {
        id: true,
        code: true,
        name: true,
        activeFrom: true,
        version: true,
        elderAssignments: {
          where: { endDate: null },
          take: 1,
          select: {
            startDate: true,
            member: { select: { id: true, firstNames: true, preferredName: true, lastName: true } },
          },
        },
      },
      orderBy: [{ code: 'asc' }, { name: 'asc' }],
    }),
    prisma.member.findMany({
      where: { AND: [memberScopeWhere(readAccess.scope), { status: 'ACTIVE', archivedAt: null }] },
      select: {
        id: true,
        firstNames: true,
        preferredName: true,
        lastName: true,
        wardAssignments: { where: { endDate: null }, take: 1, select: { ward: { select: { id: true, code: true, name: true } } } },
        householdHistory: {
          where: { endDate: null },
          take: 1,
          select: { household: { select: { wardAssignments: { where: { endDate: null }, take: 1, select: { ward: { select: { id: true, code: true, name: true } } } } } } },
        },
        elderAssignments: { where: { endDate: null }, take: 1, select: { ward: { select: { id: true, code: true, name: true } } } },
      },
      orderBy: [{ lastName: 'asc' }, { firstNames: 'asc' }],
      take: 2000,
    }),
  ])

  const counts = new Map<string, number>()
  const candidates = members.map((member) => {
    const ownWard = member.wardAssignments[0]?.ward ?? member.householdHistory[0]?.household.wardAssignments[0]?.ward ?? null
    if (ownWard) counts.set(ownWard.id, (counts.get(ownWard.id) ?? 0) + 1)
    const elderWard = member.elderAssignments[0]?.ward ?? null
    return {
      id: member.id,
      name: displayName(member),
      ownWard,
      elderWard,
    }
  })

  return {
    canCreate: writeAccess.scope.kind === 'GLOBAL',
    wards: wards.map((ward) => {
      const elder = ward.elderAssignments[0]
      return {
        id: ward.id,
        code: ward.code,
        name: ward.name,
        activeFrom: ward.activeFrom,
        version: ward.version,
        memberCount: counts.get(ward.id) ?? 0,
        elder: elder ? { ...elder.member, name: displayName(elder.member), since: elder.startDate } : null,
      }
    }),
    candidates,
  }
}

type WardTx = Prisma.TransactionClient

async function actorForWardWrite(tx: WardTx, actorId: string) {
  const access = await requireMemberCapability(actorId, 'WARD_WRITE', tx)
  const actor = await tx.user.findUnique({ where: { id: actorId }, select: { id: true, name: true, role: true, disabledAt: true } })
  if (!actor || actor.disabledAt) throw new WardCommandError('NOT_FOUND', 'Wykbestuur nie beskikbaar nie')
  return { access, actor }
}

async function validateElder(tx: WardTx, actorId: string, elderId: string | null, wardId?: string) {
  if (!elderId) return null
  const readAccess = await requireMemberCapability(actorId, 'MEMBER_READ', tx)
  const member = await tx.member.findFirst({
    where: { AND: [{ id: elderId }, memberScopeWhere(readAccess.scope), { status: 'ACTIVE', archivedAt: null }] },
    select: {
      id: true,
      firstNames: true,
      preferredName: true,
      lastName: true,
      elderAssignments: { where: { endDate: null, ...(wardId ? { wardId: { not: wardId } } : {}) }, take: 1, select: { ward: { select: { code: true, name: true } } } },
    },
  })
  if (!member) throw new WardCommandError('NOT_FOUND', 'Ouderling nie beskikbaar nie')
  const otherWard = member.elderAssignments[0]?.ward
  if (otherWard) throw new WardCommandError('INVALID', `${displayName(member)} is reeds ouderling van ${otherWard.code}: ${otherWard.name}.`)
  return member
}

async function auditWard(tx: WardTx, actor: Awaited<ReturnType<typeof actorForWardWrite>>['actor'], wardId: string, action: string, changes: Prisma.InputJsonValue) {
  await tx.memberAuditEvent.create({
    data: { entityType: 'Ward', entityId: wardId, action, actorId: actor.id, actorNameSnapshot: actor.name, actorRoleSnapshot: actor.role, source: 'ADMIN', changes },
  })
}

async function auditMemberElder(tx: WardTx, actor: Awaited<ReturnType<typeof actorForWardWrite>>['actor'], memberId: string, action: string, wardLabel: string, assigned: boolean) {
  await tx.memberAuditEvent.create({
    data: {
      entityType: 'Member', entityId: memberId, action, actorId: actor.id,
      actorNameSnapshot: actor.name, actorRoleSnapshot: actor.role, source: 'ADMIN',
      changes: assigned ? { before: { elderOf: null }, after: { elderOf: wardLabel } } : { before: { elderOf: wardLabel }, after: { elderOf: null } },
    },
  })
}

export async function createWard(actorId: string, input: WardInput) {
  const normalized = normalizeWardInput(input)
  try {
    return await prisma.$transaction(async (tx) => {
      const { access, actor } = await actorForWardWrite(tx, actorId)
      if (access.scope.kind !== 'GLOBAL') throw new WardCommandError('NOT_FOUND', 'Wykbestuur nie beskikbaar nie')
      const elder = await validateElder(tx, actorId, normalized.elderId)
      const ward = await tx.ward.create({ data: { code: normalized.code, name: normalized.name, activeFrom: normalized.activeFrom } })
      if (elder) await tx.wardElderAssignment.create({ data: { wardId: ward.id, memberId: elder.id, startDate: normalized.elderStartDate } })
      await auditWard(tx, actor, ward.id, 'CREATE', { after: { code: ward.code, name: ward.name, elder: elder ? displayName(elder) : null } })
      if (elder) await auditMemberElder(tx, actor, elder.id, 'ELDER_ASSIGNMENT_ADD', `${ward.code}: ${ward.name}`, true)
      return ward
    }, { isolationLevel: 'Serializable' })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new WardCommandError('CONFLICT', 'Daardie wykkode bestaan reeds.')
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw new WardCommandError('CONFLICT', 'Die wyk is intussen verander.')
    throw error
  }
}

export async function updateWard(actorId: string, input: WardInput & { wardId: string; version: number }) {
  const normalized = normalizeWardInput(input)
  try {
    return await prisma.$transaction(async (tx) => {
      const { access, actor } = await actorForWardWrite(tx, actorId)
      const current = await tx.ward.findFirst({
        where: { AND: [{ id: input.wardId }, wardWhere(access.scope), { activeTo: null }] },
        include: { elderAssignments: { where: { endDate: null }, take: 1, include: { member: true } } },
      })
      if (!current) throw new WardCommandError('NOT_FOUND', 'Wyk nie beskikbaar nie')
      if (current.version !== input.version) throw new WardCommandError('CONFLICT', 'Die wyk is intussen verander.')
      const elder = await validateElder(tx, actorId, normalized.elderId, current.id)
      const currentElder = current.elderAssignments[0] ?? null
      const elderChanged = currentElder?.memberId !== elder?.id
      const wardChanged = current.code !== normalized.code || current.name !== normalized.name || current.activeFrom.toISOString().slice(0, 10) !== normalized.activeFrom.toISOString().slice(0, 10)
      if (!wardChanged && !elderChanged) return current
      if (elderChanged && currentElder && normalized.elderStartDate <= currentElder.startDate) {
        throw new WardCommandError('INVALID', 'Die nuwe dienstyd moet ná die huidige ouderling se begindatum begin.')
      }
      const changed = await tx.ward.updateMany({
        where: { id: current.id, version: input.version },
        data: { code: normalized.code, name: normalized.name, activeFrom: normalized.activeFrom, version: { increment: 1 } },
      })
      if (changed.count !== 1) throw new WardCommandError('CONFLICT', 'Die wyk is intussen verander.')
      if (elderChanged && currentElder) await tx.wardElderAssignment.update({ where: { id: currentElder.id }, data: { endDate: normalized.elderStartDate } })
      if (elderChanged && elder) await tx.wardElderAssignment.create({ data: { wardId: current.id, memberId: elder.id, startDate: normalized.elderStartDate } })
      await auditWard(tx, actor, current.id, 'UPDATE', {
        before: { code: current.code, name: current.name, elder: currentElder ? displayName(currentElder.member) : null },
        after: { code: normalized.code, name: normalized.name, elder: elder ? displayName(elder) : null },
      })
      if (elderChanged && currentElder) await auditMemberElder(tx, actor, currentElder.memberId, 'ELDER_ASSIGNMENT_END', `${current.code}: ${current.name}`, false)
      if (elderChanged && elder) await auditMemberElder(tx, actor, elder.id, 'ELDER_ASSIGNMENT_ADD', `${normalized.code}: ${normalized.name}`, true)
      return { ...current, version: current.version + 1 }
    }, { isolationLevel: 'Serializable' })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new WardCommandError('CONFLICT', 'Daardie wykkode bestaan reeds.')
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw new WardCommandError('CONFLICT', 'Die wyk is intussen verander.')
    throw error
  }
}
