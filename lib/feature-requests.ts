export const FEATURE_REQUEST_STATUSES = [
  'NEW',
  'PLANNED',
  'IN_PROGRESS',
  'WAITING_FOR_FEEDBACK',
  'DONE',
  'NOT_PLANNED',
] as const

export type FeatureRequestStatusValue = (typeof FEATURE_REQUEST_STATUSES)[number]

export const FEATURE_REQUEST_STATUS_LABELS: Record<FeatureRequestStatusValue, string> = {
  NEW: 'Nuut',
  PLANNED: 'Beplan',
  IN_PROGRESS: 'Besig',
  WAITING_FOR_FEEDBACK: 'Wag vir terugvoer',
  DONE: 'Voltooi',
  NOT_PLANNED: 'Nie beplan nie',
}

export const ACTIVE_FEATURE_REQUEST_STATUSES = FEATURE_REQUEST_STATUSES.slice(0, 4)
export const CLOSED_FEATURE_REQUEST_STATUSES = FEATURE_REQUEST_STATUSES.slice(4)

export const FEATURE_REQUEST_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const
export type FeatureRequestPriorityValue = (typeof FEATURE_REQUEST_PRIORITIES)[number]

export const FEATURE_REQUEST_PRIORITY_LABELS: Record<FeatureRequestPriorityValue, string> = {
  LOW: 'Laag',
  NORMAL: 'Normaal',
  HIGH: 'Hoog',
  URGENT: 'Dringend',
}

export const FEATURE_REQUEST_DRAFT_STORAGE_PREFIX = 'annlin-feature-request-draft-v1'

export function isClosedFeatureRequest(status: FeatureRequestStatusValue): boolean {
  return CLOSED_FEATURE_REQUEST_STATUSES.includes(status as (typeof CLOSED_FEATURE_REQUEST_STATUSES)[number])
}

export type FeatureRequestSummary = {
  id: string
  title: string
  status: FeatureRequestStatusValue
  priority: FeatureRequestPriorityValue
  nextAction: string | null
  pagePath: string | null
  workflowVersion: number
  lastActivityAt: string
  createdAt: string
  requester: { id: string; name: string }
  assignee: { id: string; name: string } | null
  coverImage: { url: string; filename: string } | null
  messageCount: number
  unread: boolean
}

export type FeatureRequestAttachmentDto = {
  id: string
  url: string
  filename: string
  mimeType: string
  size: number
  activityId: string | null
}

export type PendingFeatureRequestAttachment = Omit<FeatureRequestAttachmentDto, 'id' | 'activityId'> & {
  pathname: string
}

export type FeatureRequestActivityDto = {
  id: string
  seq: number
  kind: 'CREATED' | 'MESSAGE' | 'WORKFLOW'
  body: string | null
  changes: Record<string, unknown> | null
  createdAt: string
  actor: { id: string; name: string }
  attachments: FeatureRequestAttachmentDto[]
}

export type FeatureRequestDetail = FeatureRequestSummary & {
  description: string
  attachments: FeatureRequestAttachmentDto[]
  activities: FeatureRequestActivityDto[]
  throughSeq: number
  hasMoreActivities: boolean
}
