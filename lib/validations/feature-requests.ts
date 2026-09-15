import { z } from 'zod'
import { FEATURE_REQUEST_PRIORITIES, FEATURE_REQUEST_STATUSES } from '@/lib/feature-requests'

const operationKey = z.string().trim().min(8).max(100)
const messageText = z.string().trim().min(1, 'Voer asseblief teks in').max(10_000, 'Teks mag nie langer as 10 000 karakters wees nie')
const pagePath = z.string().trim().max(500).regex(/^\/[^?#]*$/, 'Bladsykonteks moet ’n relatiewe pad wees')

export const createFeatureRequestSchema = z.object({
  title: z.string().trim().min(1, 'Opskrif is verplig').max(160, 'Opskrif mag nie langer as 160 karakters wees nie'),
  description: messageText,
  pagePath: pagePath.nullable().optional(),
  operationKey,
})

export const createFeatureRequestMessageSchema = z.object({
  body: messageText,
  operationKey,
})

export const updateFeatureRequestWorkflowSchema = z.object({
  status: z.enum(FEATURE_REQUEST_STATUSES).optional(),
  priority: z.enum(FEATURE_REQUEST_PRIORITIES).optional(),
  assigneeId: z.string().trim().min(1).nullable().optional(),
  nextAction: z.string().trim().max(10_000).nullable().optional(),
  note: messageText,
  workflowVersion: z.number().int().nonnegative(),
  operationKey,
}).refine((value) => value.status || value.priority || value.assigneeId !== undefined || value.nextAction !== undefined, {
  message: 'Geen verandering is gekies nie',
})

export const markFeatureRequestReadSchema = z.object({
  throughSeq: z.number().int().nonnegative(),
})

export const featureRequestListQuerySchema = z.object({
  scope: z.enum(['mine', 'all', 'unread']).default('mine'),
  status: z.enum(FEATURE_REQUEST_STATUSES).optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateFeatureRequestInput = z.infer<typeof createFeatureRequestSchema>
export type CreateFeatureRequestMessageInput = z.infer<typeof createFeatureRequestMessageSchema>
export type UpdateFeatureRequestWorkflowInput = z.infer<typeof updateFeatureRequestWorkflowSchema>
