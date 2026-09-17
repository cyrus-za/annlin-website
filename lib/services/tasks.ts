import { createHash } from 'node:crypto'
import { Prisma, type UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'
import type {
  CreateTaskInput,
  CreateTaskMessageInput,
  TaskAttachmentInput,
  UpdateTaskWorkflowInput,
} from '@/lib/validations/tasks'
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type TaskStatusValue,
  type TaskSummary,
  type TaskSourceValue,
} from '@/lib/tasks'
import { isAllowedR2Upload, isAllowedR2UploadFilename, isAllowedR2UploadKey } from '@/lib/r2-upload-policy'

export type TaskActor = { id: string; role: UserRole }

export class TaskError extends Error {
  constructor(public code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'INVALID', message: string) {
    super(message)
  }
}

function payloadHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function attachmentData(
  actorId: string,
  attachment: TaskAttachmentInput,
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
    throw new TaskError('INVALID', 'Ongeldige beeldaanhegsel')
  }
  return { ...attachment, uploaderId: actorId }
}

function canAccess(actor: TaskActor, requesterId: string): boolean {
  return actor.role === 'ADMIN' || requesterId === actor.id
}

async function requireAccessibleTask(actor: TaskActor, id: string) {
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || !canAccess(actor, task.requesterId)) {
    throw new TaskError('NOT_FOUND', 'Taak nie gevind nie')
  }
  return task
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
    throw new TaskError('INVALID', 'Ongeldige lysmerker')
  }
}

function toSummary(request: Awaited<ReturnType<typeof getTaskRows>>[number]): TaskSummary {
  const lastReadSeq = request.receipts[0]?.lastReadSeq ?? 0
  const latestOtherSeq = request.activities[0]?.seq ?? 0
  return {
    id: request.id,
    title: request.title,
    status: request.status,
    priority: request.priority,
    pagePath: request.pagePath,
    source: request.source as TaskSourceValue,
    workflowVersion: request.workflowVersion,
    lastActivityAt: request.lastActivityAt.toISOString(),
    createdAt: request.createdAt.toISOString(),
    requester: request.requester,
    assignee: request.assignee,
    coverImage: request.attachments[0] ?? null,
    messageCount: request._count.activities,
    unread: latestOtherSeq > lastReadSeq,
  }
}

async function getTaskRows(ids: string[], actorId: string) {
  if (ids.length === 0) return []
  return prisma.task.findMany({
    where: { id: { in: ids } },
    include: {
      requester: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
      attachments: {
        select: { url: true, filename: true },
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
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

export async function listTasks(
  actor: TaskActor,
  options: { scope: 'mine' | 'all' | 'unread'; status?: TaskStatusValue; source?: TaskSourceValue; cursor?: string; limit: number },
) {
  const cursor = decodeCursor(options.cursor)
  const allAccessible = actor.role === 'ADMIN' && options.scope !== 'mine'
  const access = allAccessible ? Prisma.sql`TRUE` : Prisma.sql`r."requesterId" = ${actor.id}`
  const storedStatus = options.status === 'CANCELLED' ? 'NOT_PLANNED' : options.status
  const status = storedStatus ? Prisma.sql`AND r.status::text = ${storedStatus}` : Prisma.empty
  const source = options.source ? Prisma.sql`AND r.source = ${options.source}` : Prisma.empty
  const unread = options.scope === 'unread'
    ? Prisma.sql`AND EXISTS (
        SELECT 1 FROM "task_activities" a
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
    FROM "tasks" r
    LEFT JOIN "task_read_receipts" rr
      ON rr."requestId" = r.id AND rr."userId" = ${actor.id}
    WHERE ${access} ${status} ${source} ${unread} ${after}
    ORDER BY r."lastActivityAt" DESC, r.id DESC
    LIMIT ${options.limit + 1}
  `)
  const pageIds = candidates.slice(0, options.limit).map(({ id }) => id)
  const rows = await getTaskRows(pageIds, actor.id)
  const byId = new Map(rows.map((row) => [row.id, row]))
  const ordered = pageIds.flatMap((id) => byId.get(id) ? [byId.get(id)!] : [])
  const last = ordered.at(-1)

  return {
    requests: ordered.map(toSummary),
    nextCursor: candidates.length > options.limit && last ? encodeCursor(last) : null,
  }
}

export async function getTaskUnreadCount(actor: TaskActor, source?: TaskSourceValue): Promise<number> {
  const access = actor.role === 'ADMIN' ? Prisma.sql`TRUE` : Prisma.sql`r."requesterId" = ${actor.id}`
  const sourceFilter = source ? Prisma.sql`AND r.source = ${source}` : Prisma.empty
  const [row] = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS count
    FROM "tasks" r
    LEFT JOIN "task_read_receipts" rr
      ON rr."requestId" = r.id AND rr."userId" = ${actor.id}
    WHERE ${access} ${sourceFilter}
      AND EXISTS (
        SELECT 1 FROM "task_activities" a
        WHERE a."requestId" = r.id
          AND a.seq > COALESCE(rr."lastReadSeq", 0)
          AND a."actorId" <> ${actor.id}
      )
  `)
  return Number(row?.count ?? 0)
}

export async function createTask(actor: TaskActor, input: CreateTaskInput) {
  const source = input.source ?? 'PROPOSAL'
  if (source === 'MANUAL' && actor.role !== 'ADMIN') {
    throw new TaskError('FORBIDDEN', 'Slegs administrateurs kan handmatige take skep')
  }
  const normalized = { title: input.title, description: input.description, pagePath: input.pagePath ?? null, source }
  const attachments = input.attachments ?? []
  const attachmentRows = attachments.map((attachment) => attachmentData(actor.id, attachment))
  const hash = payloadHash({ ...normalized, attachments })
  const existing = await prisma.task.findUnique({
    where: { requesterId_creationKey: { requesterId: actor.id, creationKey: input.operationKey } },
  })
  if (existing) {
    if (existing.creationPayloadHash !== hash) throw new TaskError('CONFLICT', 'Hierdie stuuraksie is reeds met ander inhoud gebruik')
    return existing
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          requesterId: actor.id,
          ...normalized,
          creationKey: input.operationKey,
          creationPayloadHash: hash,
          attachments: { create: attachmentRows },
        },
      })
      await tx.taskActivity.create({
        data: {
          requestId: task.id,
          actorId: actor.id,
          seq: 1,
          kind: 'CREATED',
          operationKey: input.operationKey,
          payloadHash: hash,
        },
      })
      return task
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const replay = await prisma.task.findUnique({
        where: { requesterId_creationKey: { requesterId: actor.id, creationKey: input.operationKey } },
      })
      if (replay?.creationPayloadHash === hash) return replay
    }
    throw error
  }
}

export async function getTaskDetail(actor: TaskActor, id: string, afterSeq = 0) {
  const task = await requireAccessibleTask(actor, id)
  const [rows, activities, attachments] = await Promise.all([
    getTaskRows([id], actor.id),
    prisma.taskActivity.findMany({
      where: { requestId: id, seq: { gt: afterSeq } },
      include: { actor: { select: { id: true, name: true } } },
      orderBy: { seq: 'asc' },
      take: 101,
    }),
    prisma.taskAttachment.findMany({
      where: { requestId: id },
      select: { id: true, url: true, filename: true, mimeType: true, size: true, activityId: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])
  const row = rows[0]
  if (!row) throw new TaskError('NOT_FOUND', 'Taak nie gevind nie')
  const page = activities.slice(0, 100)
  return {
    ...toSummary(row),
    description: task.description,
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

export async function addTaskMessage(
  actor: TaskActor,
  id: string,
  input: CreateTaskMessageInput,
) {
  await requireAccessibleTask(actor, id)
  const attachments = input.attachments ?? []
  const attachmentRows = attachments.map((attachment) => attachmentData(actor.id, attachment))
  const hash = payloadHash({ body: input.body, attachments })
  const unique = { requestId: id, actorId: actor.id, kind: 'MESSAGE' as const, operationKey: input.operationKey }
  const existing = await prisma.taskActivity.findUnique({ where: { requestId_actorId_kind_operationKey: unique } })
  if (existing) {
    if (existing.payloadHash !== hash) throw new TaskError('CONFLICT', 'Hierdie stuuraksie is reeds met ander inhoud gebruik')
    return existing
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id },
        data: { activitySeq: { increment: 1 }, lastActivityAt: new Date() },
      })
      const activity = await tx.taskActivity.create({
        data: { ...unique, seq: task.activitySeq, body: input.body, payloadHash: hash },
      })
      if (attachmentRows.length > 0) {
        await tx.taskAttachment.createMany({
          data: attachmentRows.map((attachment) => ({ ...attachment, requestId: id, activityId: activity.id })),
        })
      }
      return activity
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const replay = await prisma.taskActivity.findUnique({ where: { requestId_actorId_kind_operationKey: unique } })
      if (replay?.payloadHash === hash) return replay
    }
    throw error
  }
}

export async function updateTaskWorkflow(
  actor: TaskActor,
  id: string,
  input: UpdateTaskWorkflowInput,
) {
  if (actor.role !== 'ADMIN') throw new TaskError('FORBIDDEN', 'Onvoldoende regte')
  const hash = payloadHash(input)
  const unique = { requestId: id, actorId: actor.id, kind: 'WORKFLOW' as const, operationKey: input.operationKey }
  const replay = await prisma.taskActivity.findUnique({ where: { requestId_actorId_kind_operationKey: unique } })
  if (replay) {
    if (replay.payloadHash !== hash) throw new TaskError('CONFLICT', 'Hierdie stooraksie is reeds met ander waardes gebruik')
    return requireAccessibleTask(actor, id)
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.task.findUnique({ where: { id } })
      if (!current) throw new TaskError('NOT_FOUND', 'Taak nie gevind nie')
      if (current.workflowVersion !== input.workflowVersion) {
        throw new TaskError('CONFLICT', 'Hierdie taak is intussen verander')
      }

      const status = input.status ?? current.status
      const assigneeId = input.assigneeId === undefined ? current.assigneeId : input.assigneeId
      if ((status === 'PLANNED' || status === 'IN_PROGRESS') && !assigneeId) {
        throw new TaskError('INVALID', 'Beplan en Besig vereis ’n verantwoordelike persoon')
      }
      let assigneeName: string | null = null
      if (assigneeId) {
        const eligible = await tx.user.findFirst({ where: { id: assigneeId, role: 'ADMIN', emailVerified: true }, select: { id: true, name: true } })
        if (!eligible) throw new TaskError('INVALID', 'Kies ’n aktiewe administrateur')
        assigneeName = eligible.name
      }

      const changed = await tx.task.updateMany({
        where: { id, workflowVersion: input.workflowVersion },
        data: {
          status,
          priority: input.priority ?? current.priority,
          assigneeId,
          workflowVersion: { increment: 1 },
          activitySeq: { increment: 1 },
          lastActivityAt: new Date(),
          closedAt: status === 'DONE' || status === 'CANCELLED' ? new Date() : null,
        },
      })
      if (changed.count !== 1) throw new TaskError('CONFLICT', 'Hierdie taak is intussen verander')
      const updated = await tx.task.findUniqueOrThrow({ where: { id } })
      const activeWorkCount = status === 'IN_PROGRESS'
        ? await tx.task.count({ where: { status: 'IN_PROGRESS', id: { not: id } } })
        : 0
      const changes = {
        before: { status: current.status, priority: current.priority, assigneeId: current.assigneeId },
        after: { status: updated.status, priority: updated.priority, assigneeId: updated.assigneeId },
        wipLimitOverridden: status === 'IN_PROGRESS' && activeWorkCount >= 3,
      }
      const summary = [
        status !== current.status ? `Status na ${TASK_STATUS_LABELS[status]} verander.` : null,
        (input.priority && input.priority !== current.priority) ? `Prioriteit na ${TASK_PRIORITY_LABELS[input.priority]} verander.` : null,
        input.assigneeId !== undefined && assigneeId !== current.assigneeId
          ? assigneeName ? `${assigneeName} is as verantwoordelike persoon toegewys.` : 'Verantwoordelike persoon is verwyder.'
          : null,
      ].filter(Boolean).join(' ')
      await tx.taskActivity.create({
        data: { ...unique, seq: updated.activitySeq, body: summary || 'Taakbeplanning is opgedateer.', changes, payloadHash: hash },
      })
      await tx.auditLog.create({
        data: { userId: actor.id, action: 'UPDATE_TASK', entityType: 'Task', entityId: id, changes },
      })
      return updated
    })
  } catch (error) {
    const completed = await prisma.taskActivity.findUnique({
      where: { requestId_actorId_kind_operationKey: unique },
    })
    if (completed) {
      if (completed.payloadHash !== hash) {
        throw new TaskError('CONFLICT', 'Hierdie stooraksie is reeds met ander waardes gebruik')
      }
      return requireAccessibleTask(actor, id)
    }
    throw error
  }
}

export async function markTaskRead(actor: TaskActor, id: string, throughSeq: number) {
  const task = await requireAccessibleTask(actor, id)
  if (throughSeq > task.activitySeq) throw new TaskError('INVALID', 'Ongeldige leesposisie')
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "task_read_receipts" ("requestId", "userId", "lastReadSeq", "updatedAt")
    VALUES (${id}, ${actor.id}, ${throughSeq}, NOW())
    ON CONFLICT ("requestId", "userId") DO UPDATE
    SET "lastReadSeq" = GREATEST("task_read_receipts"."lastReadSeq", EXCLUDED."lastReadSeq"),
        "updatedAt" = NOW()
  `)
}

export async function getTaskAssignees(actor: TaskActor) {
  if (actor.role !== 'ADMIN') throw new TaskError('FORBIDDEN', 'Onvoldoende regte')
  return prisma.user.findMany({
    where: { role: 'ADMIN', emailVerified: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}
