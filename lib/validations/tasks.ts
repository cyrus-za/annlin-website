import { z } from 'zod'
import { TASK_PRIORITIES, TASK_SOURCES, TASK_STATUSES } from '@/lib/tasks'

const operationKey = z.string().trim().min(8).max(100)
const messageText = z.string().trim().min(1, 'Voer asseblief teks in').max(10_000, 'Teks mag nie langer as 10 000 karakters wees nie')
const pagePath = z.string().trim().max(500).regex(/^\/[^?#]*$/, 'Bladsykonteks moet ’n relatiewe pad wees')
export const taskAttachmentSchema = z.object({
  url: z.string().url().max(2000),
  pathname: z.string().trim().min(1).max(500),
  filename: z.string().trim().min(1).max(255),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().int().positive().max(10 * 1024 * 1024),
})
const attachments = z.array(taskAttachmentSchema).max(5, 'Heg hoogstens vyf beelde aan').default([])

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Opskrif is verplig').max(160, 'Opskrif mag nie langer as 160 karakters wees nie'),
  description: messageText,
  pagePath: pagePath.nullable().optional(),
  source: z.enum(TASK_SOURCES).default('PROPOSAL'),
  operationKey,
  attachments,
})

export const createTaskMessageSchema = z.object({
  body: messageText,
  operationKey,
  attachments,
})

export const updateTaskWorkflowSchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assigneeId: z.string().trim().min(1).nullable().optional(),
  workflowVersion: z.number().int().nonnegative(),
  operationKey,
}).refine((value) => value.status || value.priority || value.assigneeId !== undefined, {
  message: 'Geen verandering is gekies nie',
})

export const markTaskReadSchema = z.object({
  throughSeq: z.number().int().nonnegative(),
})

export const taskListQuerySchema = z.object({
  scope: z.enum(['mine', 'all', 'unread']).default('mine'),
  status: z.enum(TASK_STATUSES).optional(),
  source: z.enum(TASK_SOURCES).optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type TaskAttachmentInput = z.infer<typeof taskAttachmentSchema>
export type CreateTaskInput = z.input<typeof createTaskSchema>
export type CreateTaskMessageInput = z.input<typeof createTaskMessageSchema>
export type UpdateTaskWorkflowInput = z.infer<typeof updateTaskWorkflowSchema>
