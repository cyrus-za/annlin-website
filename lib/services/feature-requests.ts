import { createHash } from 'node:crypto'
import { Prisma, type UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'
import type {
  CreateFeatureRequestInput,
  CreateFeatureRequestMessageInput,
  FeatureRequestAttachmentInput,
  UpdateFeatureRequestWorkflowInput,
} from '@/lib/validations/feature-requests'
import type { FeatureRequestStatusValue, FeatureRequestSummary } from '@/lib/feature-requests'
import { isAllowedR2Upload, isAllowedR2UploadFilename, isAllowedR2UploadKey } from '@/lib/r2-upload-policy'

export type FeatureRequestActor = { id: string; role: UserRole }

export class FeatureRequestError extends Error {
  constructor(public code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'INVALID', message: string) {
    super(message)
  }
}

function payloadHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function attachmentData(
  actorId: string,
  attachment: FeatureRequestAttachmentInput,
) {
  const publicBaseUrl = process.env['R2_PUBLIC_BASE_URL']?.replace(/\/+$/, '')
  const encodedPath = attachment.pathname.split('/').map(encodeURIComponent).join('/')
  if (
    !publicBaseUrl ||
    attachment.url !== `${publicBaseUrl}/${encodedPath}` ||
    !isAllowedR2Upload(attachment.mimeType, attachment.size) ||
    !attachment.mimeType.startsWith('image/') ||
    !isAllowedR2UploadFilename(attachment.filename, attachment.mimeType) ||
    !isAllowedR2UploadKey(attachment.pathname, attachment.mimeType)
  ) {
    throw new FeatureRequestError('INVALID', 'Ongeldige beeldaanhegsel')
  }
  return { ...attachment, uploaderId: actorId }
}

function canAccess(actor: FeatureRequestActor, requesterId: string): boolean {
  return actor.role === 'ADMIN' || requesterId === actor.id
}

async function requireAccessibleRequest(actor: FeatureRequestActor, id: string) {
  const request = await prisma.featureRequest.findUnique({ where: { id } })
  if (!request || !canAccess(actor, request.requesterId)) {
    throw new FeatureRequestError('NOT_FOUND', 'Voorstel nie gevind nie')
  }
  return request
}

function encodeCursor(request: { id: string; lastActivityAt: Date }): string {
  return Buffer.from(JSON.stringify([request.lastActivityAt.toISOString(), request.id])).toString('base64url')
}

function decodeCursor(cursor?: string): [Date, string] | null {
  if (!cursor) return null
  try {
    const [date, id] = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as [string, string]
    const parsed = new Date(date)
    return Number.isNaN(parsed.getTime()) || !id ? null : [parsed, id]
  } catch {
    throw new FeatureRequestError('INVALID', 'Ongeldige lysmerker')
  }
}

function toSummary(request: Awaited<ReturnType<typeof getRequestRows>>[number]): FeatureRequestSummary {
  const lastReadSeq = request.receipts[0]?.lastReadSeq ?? 0
  const latestOtherSeq = request.activities[0]?.seq ?? 0
  return {
    id: request.id,
    title: request.title,
    status: request.status,
    priority: request.priority,
    nextAction: request.nextAction,
    pagePath: request.pagePath,
    workflowVersion: request.workflowVersion,
    lastActivityAt: request.lastActivityAt.toISOString(),
    createdAt: request.createdAt.toISOString(),
    requester: request.requester,
    assignee: request.assignee,
    messageCount: request._count.activities,
    unread: latestOtherSeq > lastReadSeq,
  }
}

async function getRequestRows(ids: string[], actorId: string) {
  if (ids.length === 0) return []
  return prisma.featureRequest.findMany({
    where: { id: { in: ids } },
    include: {
      requester: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
      receipts: { where: { userId: actorId }, select: { lastReadSeq: true }, take: 1 },
      activities: {
        where: { actorId: { not: actorId } },
        select: { seq: true },
        orderBy: { seq: 'desc' },
        take: 1,
      },
      _count: { select: { activities: { where: { kind: 'MESSAGE' } } } },
    },
  })
}

export async function listFeatureRequests(
  actor: FeatureRequestActor,
  options: { scope: 'mine' | 'all' | 'unread'; status?: FeatureRequestStatusValue; cursor?: string; limit: number },
) {
  const cursor = decodeCursor(options.cursor)
  const allAccessible = actor.role === 'ADMIN' && options.scope !== 'mine'
  const access = allAccessible ? Prisma.sql`TRUE` : Prisma.sql`r."requesterId" = ${actor.id}`
  const status = options.status ? Prisma.sql`AND r.status = ${options.status}::"FeatureRequestStatus"` : Prisma.empty
  const unread = options.scope === 'unread'
    ? Prisma.sql`AND EXISTS (
        SELECT 1 FROM "feature_request_activities" a
        WHERE a."requestId" = r.id
          AND a.seq > COALESCE(rr."lastReadSeq", 0)
          AND a."actorId" <> ${actor.id}
      )`
    : Prisma.empty
  const after = cursor
    ? Prisma.sql`AND (r."lastActivityAt" < ${cursor[0]} OR (r."lastActivityAt" = ${cursor[0]} AND r.id < ${cursor[1]}))`
    : Prisma.empty
  const candidates = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT r.id
    FROM "feature_requests" r
    LEFT JOIN "feature_request_read_receipts" rr
      ON rr."requestId" = r.id AND rr."userId" = ${actor.id}
    WHERE ${access} ${status} ${unread} ${after}
    ORDER BY r."lastActivityAt" DESC, r.id DESC
    LIMIT ${options.limit + 1}
  `)
  const pageIds = candidates.slice(0, options.limit).map(({ id }) => id)
  const rows = await getRequestRows(pageIds, actor.id)
  const byId = new Map(rows.map((row) => [row.id, row]))
  const ordered = pageIds.flatMap((id) => byId.get(id) ? [byId.get(id)!] : [])
  const last = ordered.at(-1)

  return {
    requests: ordered.map(toSummary),
    nextCursor: candidates.length > options.limit && last ? encodeCursor(last) : null,
  }
}

export async function getFeatureRequestUnreadCount(actor: FeatureRequestActor): Promise<number> {
  const access = actor.role === 'ADMIN' ? Prisma.sql`TRUE` : Prisma.sql`r."requesterId" = ${actor.id}`
  const [row] = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS count
    FROM "feature_requests" r
    LEFT JOIN "feature_request_read_receipts" rr
      ON rr."requestId" = r.id AND rr."userId" = ${actor.id}
    WHERE ${access}
      AND EXISTS (
        SELECT 1 FROM "feature_request_activities" a
        WHERE a."requestId" = r.id
          AND a.seq > COALESCE(rr."lastReadSeq", 0)
          AND a."actorId" <> ${actor.id}
      )
  `)
  return Number(row?.count ?? 0)
}

export async function createFeatureRequest(actor: FeatureRequestActor, input: CreateFeatureRequestInput) {
  const normalized = { title: input.title, description: input.description, pagePath: input.pagePath ?? null }
  const attachments = input.attachments ?? []
  const attachmentRows = attachments.map((attachment) => attachmentData(actor.id, attachment))
  const hash = payloadHash({ ...normalized, attachments })
  const existing = await prisma.featureRequest.findUnique({
    where: { requesterId_creationKey: { requesterId: actor.id, creationKey: input.operationKey } },
  })
  if (existing) {
    if (existing.creationPayloadHash !== hash) throw new FeatureRequestError('CONFLICT', 'Hierdie stuuraksie is reeds met ander inhoud gebruik')
    return existing
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.featureRequest.create({
        data: {
          requesterId: actor.id,
          ...normalized,
          creationKey: input.operationKey,
          creationPayloadHash: hash,
          attachments: { create: attachmentRows },
        },
      })
      await tx.featureRequestActivity.create({
        data: {
          requestId: request.id,
          actorId: actor.id,
          seq: 1,
          kind: 'CREATED',
          operationKey: input.operationKey,
          payloadHash: hash,
        },
      })
      return request
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const replay = await prisma.featureRequest.findUnique({
        where: { requesterId_creationKey: { requesterId: actor.id, creationKey: input.operationKey } },
      })
      if (replay?.creationPayloadHash === hash) return replay
    }
    throw error
  }
}

export async function getFeatureRequestDetail(actor: FeatureRequestActor, id: string, afterSeq = 0) {
  const request = await requireAccessibleRequest(actor, id)
  const [rows, activities, attachments] = await Promise.all([
    getRequestRows([id], actor.id),
    prisma.featureRequestActivity.findMany({
      where: { requestId: id, seq: { gt: afterSeq } },
      include: { actor: { select: { id: true, name: true } } },
      orderBy: { seq: 'asc' },
      take: 101,
    }),
    prisma.featureRequestAttachment.findMany({
      where: { requestId: id },
      select: { id: true, url: true, filename: true, mimeType: true, size: true, activityId: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])
  const row = rows[0]
  if (!row) throw new FeatureRequestError('NOT_FOUND', 'Voorstel nie gevind nie')
  const page = activities.slice(0, 100)
  return {
    ...toSummary(row),
    description: request.description,
    attachments: attachments.filter((attachment) => attachment.activityId === null),
    activities: page.map((activity) => ({
      id: activity.id,
      seq: activity.seq,
      kind: activity.kind,
      body: activity.body,
      changes: activity.changes as Record<string, unknown> | null,
      createdAt: activity.createdAt.toISOString(),
      actor: activity.actor,
      attachments: attachments.filter((attachment) => attachment.activityId === activity.id),
    })),
    throughSeq: page.at(-1)?.seq ?? afterSeq,
    hasMoreActivities: activities.length > 100,
  }
}

export async function addFeatureRequestMessage(
  actor: FeatureRequestActor,
  id: string,
  input: CreateFeatureRequestMessageInput,
) {
  await requireAccessibleRequest(actor, id)
  const attachments = input.attachments ?? []
  const attachmentRows = attachments.map((attachment) => attachmentData(actor.id, attachment))
  const hash = payloadHash({ body: input.body, attachments })
  const unique = { requestId: id, actorId: actor.id, kind: 'MESSAGE' as const, operationKey: input.operationKey }
  const existing = await prisma.featureRequestActivity.findUnique({ where: { requestId_actorId_kind_operationKey: unique } })
  if (existing) {
    if (existing.payloadHash !== hash) throw new FeatureRequestError('CONFLICT', 'Hierdie stuuraksie is reeds met ander inhoud gebruik')
    return existing
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.featureRequest.update({
        where: { id },
        data: { activitySeq: { increment: 1 }, lastActivityAt: new Date() },
      })
      const activity = await tx.featureRequestActivity.create({
        data: { ...unique, seq: request.activitySeq, body: input.body, payloadHash: hash },
      })
      if (attachmentRows.length > 0) {
        await tx.featureRequestAttachment.createMany({
          data: attachmentRows.map((attachment) => ({ ...attachment, requestId: id, activityId: activity.id })),
        })
      }
      return activity
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const replay = await prisma.featureRequestActivity.findUnique({ where: { requestId_actorId_kind_operationKey: unique } })
      if (replay?.payloadHash === hash) return replay
    }
    throw error
  }
}

export async function updateFeatureRequestWorkflow(
  actor: FeatureRequestActor,
  id: string,
  input: UpdateFeatureRequestWorkflowInput,
) {
  if (actor.role !== 'ADMIN') throw new FeatureRequestError('FORBIDDEN', 'Onvoldoende regte')
  const hash = payloadHash(input)
  const unique = { requestId: id, actorId: actor.id, kind: 'WORKFLOW' as const, operationKey: input.operationKey }
  const replay = await prisma.featureRequestActivity.findUnique({ where: { requestId_actorId_kind_operationKey: unique } })
  if (replay) {
    if (replay.payloadHash !== hash) throw new FeatureRequestError('CONFLICT', 'Hierdie stooraksie is reeds met ander waardes gebruik')
    return requireAccessibleRequest(actor, id)
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.featureRequest.findUnique({ where: { id } })
      if (!current) throw new FeatureRequestError('NOT_FOUND', 'Voorstel nie gevind nie')
      if (current.workflowVersion !== input.workflowVersion) {
        throw new FeatureRequestError('CONFLICT', 'Hierdie voorstel is intussen verander')
      }

      const status = input.status ?? current.status
      const assigneeId = input.assigneeId === undefined ? current.assigneeId : input.assigneeId
      const nextAction = input.nextAction === undefined ? current.nextAction : input.nextAction
      if ((status === 'PLANNED' || status === 'IN_PROGRESS') && (!assigneeId || !nextAction?.trim())) {
        throw new FeatureRequestError('INVALID', 'Beplan en Besig vereis ’n verantwoordelike persoon en volgende stap')
      }
      if (assigneeId) {
        const eligible = await tx.user.findFirst({ where: { id: assigneeId, role: 'ADMIN', emailVerified: true }, select: { id: true } })
        if (!eligible) throw new FeatureRequestError('INVALID', 'Kies ’n aktiewe administrateur')
      }

      const changed = await tx.featureRequest.updateMany({
        where: { id, workflowVersion: input.workflowVersion },
        data: {
          status,
          priority: input.priority ?? current.priority,
          assigneeId,
          nextAction,
          workflowVersion: { increment: 1 },
          activitySeq: { increment: 1 },
          lastActivityAt: new Date(),
          closedAt: status === 'DONE' || status === 'NOT_PLANNED' ? new Date() : null,
        },
      })
      if (changed.count !== 1) throw new FeatureRequestError('CONFLICT', 'Hierdie voorstel is intussen verander')
      const updated = await tx.featureRequest.findUniqueOrThrow({ where: { id } })
      const activeWorkCount = status === 'IN_PROGRESS'
        ? await tx.featureRequest.count({ where: { status: 'IN_PROGRESS', id: { not: id } } })
        : 0
      const changes = {
        before: { status: current.status, priority: current.priority, assigneeId: current.assigneeId, nextAction: current.nextAction },
        after: { status: updated.status, priority: updated.priority, assigneeId: updated.assigneeId, nextAction: updated.nextAction },
        wipLimitOverridden: status === 'IN_PROGRESS' && activeWorkCount >= 3,
      }
      await tx.featureRequestActivity.create({
        data: { ...unique, seq: updated.activitySeq, body: input.note, changes, payloadHash: hash },
      })
      await tx.auditLog.create({
        data: { userId: actor.id, action: 'UPDATE_FEATURE_REQUEST', entityType: 'FeatureRequest', entityId: id, changes },
      })
      return updated
    })
  } catch (error) {
    const completed = await prisma.featureRequestActivity.findUnique({
      where: { requestId_actorId_kind_operationKey: unique },
    })
    if (completed) {
      if (completed.payloadHash !== hash) {
        throw new FeatureRequestError('CONFLICT', 'Hierdie stooraksie is reeds met ander waardes gebruik')
      }
      return requireAccessibleRequest(actor, id)
    }
    throw error
  }
}

export async function markFeatureRequestRead(actor: FeatureRequestActor, id: string, throughSeq: number) {
  const request = await requireAccessibleRequest(actor, id)
  if (throughSeq > request.activitySeq) throw new FeatureRequestError('INVALID', 'Ongeldige leesposisie')
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "feature_request_read_receipts" ("requestId", "userId", "lastReadSeq", "updatedAt")
    VALUES (${id}, ${actor.id}, ${throughSeq}, NOW())
    ON CONFLICT ("requestId", "userId") DO UPDATE
    SET "lastReadSeq" = GREATEST("feature_request_read_receipts"."lastReadSeq", EXCLUDED."lastReadSeq"),
        "updatedAt" = NOW()
  `)
}

export async function getFeatureRequestAssignees(actor: FeatureRequestActor) {
  if (actor.role !== 'ADMIN') throw new FeatureRequestError('FORBIDDEN', 'Onvoldoende regte')
  return prisma.user.findMany({
    where: { role: 'ADMIN', emailVerified: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}
