export const TASK_STATUSES = [
  'NEW',
  'PLANNED',
  'IN_PROGRESS',
  'WAITING_FOR_FEEDBACK',
  'DONE',
  'CANCELLED',
] as const

export type TaskStatusValue = (typeof TASK_STATUSES)[number]

export const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  NEW: 'Nuut',
  PLANNED: 'Beplan',
  IN_PROGRESS: 'Besig',
  WAITING_FOR_FEEDBACK: 'Wag vir terugvoer',
  DONE: 'Voltooi',
  CANCELLED: 'Gekanselleer',
}

export const ACTIVE_TASK_STATUSES = TASK_STATUSES.slice(0, 4)
export const CLOSED_TASK_STATUSES = TASK_STATUSES.slice(4)

export const TASK_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const
export type TaskPriorityValue = (typeof TASK_PRIORITIES)[number]

export const TASK_SOURCES = ['PROPOSAL', 'MANUAL'] as const
export type TaskSourceValue = (typeof TASK_SOURCES)[number]
export const TASK_SOURCE_LABELS: Record<TaskSourceValue, string> = {
  PROPOSAL: 'Voorstel',
  MANUAL: 'Handmatig',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriorityValue, string> = {
  LOW: 'Laag',
  NORMAL: 'Normaal',
  HIGH: 'Hoog',
  URGENT: 'Dringend',
}

export const TASK_DRAFT_STORAGE_PREFIX = 'annlin-task-draft-v1'

export function isClosedTask(status: TaskStatusValue): boolean {
  return CLOSED_TASK_STATUSES.includes(status as (typeof CLOSED_TASK_STATUSES)[number])
}

export type TaskSummary = {
  id: string
  title: string
  status: TaskStatusValue
  priority: TaskPriorityValue
  pagePath: string | null
  source: TaskSourceValue
  workflowVersion: number
  lastActivityAt: string
  createdAt: string
  requester: { id: string; name: string }
  assignee: { id: string; name: string } | null
  coverImage: { url: string; filename: string } | null
  messageCount: number
  unread: boolean
}

export type TaskAttachmentDto = {
  id: string
  url: string
  filename: string
  mimeType: string
  size: number
  activityId: string | null
}

export type PendingTaskAttachment = Omit<TaskAttachmentDto, 'id' | 'activityId'> & {
  pathname: string
}

export type TaskActivityDto = {
  id: string
  seq: number
  kind: 'CREATED' | 'MESSAGE' | 'WORKFLOW'
  body: string | null
  changes: Record<string, unknown> | null
  createdAt: string
  actor: { id: string; name: string }
  attachments: TaskAttachmentDto[]
}

export type TaskDetail = TaskSummary & {
  description: string
  attachments: TaskAttachmentDto[]
  activities: TaskActivityDto[]
  throughSeq: number
  hasMoreActivities: boolean
}
