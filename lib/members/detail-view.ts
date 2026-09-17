import type { HouseholdRole, MemberContactType, MemberStatus, MembershipEventType } from '@prisma/client'
import { MEMBER_STATUS_LABELS } from './labels'

/**
 * View model for the read-only member detail page.
 *
 * Everything here is safe to hand to the page: raw audit JSON, source records and normalised
 * contact values never leave the query layer.
 */

export type MemberDetailPerson = {
  id: string
  firstNames: string
  preferredName: string | null
  lastName: string
  status: MemberStatus
}

export type MemberDetailFieldChange = {
  key: string
  label: string
  /** Null when the value is intentionally not shown. */
  before: string | null
  after: string | null
  isStatus: boolean
}

export type MemberDetail = MemberDetailPerson & {
  archivedAt: Date | null
  updatedAt: Date
  scopeKind: 'GLOBAL' | 'WARDS'
  household: {
    id: string
    name: string
    archivedAt: Date | null
    since: Date
    role: HouseholdRole
    isHead: boolean
    members: Array<MemberDetailPerson & { role: HouseholdRole; isHead: boolean; since: Date }>
  } | null
  ward: {
    id: string
    code: string
    name: string
    since: Date
    source: 'INDIVIDUAL' | 'HOUSEHOLD'
    /** Set when an individual assignment overrides a different current household ward. */
    overriddenHouseholdWard: { code: string; name: string } | null
  } | null
  contacts: Array<{
    id: string
    type: MemberContactType
    value: string
    isPreferred: boolean
    verifiedAt: Date | null
    since: Date
  }>
  events: Array<{
    id: string
    type: MembershipEventType
    effectiveDate: Date
    note: string | null
    statusChange: { before: MemberStatus; after: MemberStatus } | null
  }>
  history: Array<{
    id: string
    action: string
    actorName: string
    createdAt: Date
    fields: MemberDetailFieldChange[]
  }>
}

const MEMBER_STATUSES: ReadonlySet<string> = new Set(Object.keys(MEMBER_STATUS_LABELS))

// Audit fields that may be shown with their values. Anything else is reported by name only.
const AUDITED_MEMBER_FIELDS: Record<string, string> = {
  firstNames: 'Voorname',
  preferredName: 'Noemnaam',
  lastName: 'Van',
  status: 'Status',
}
const HIDDEN_AUDIT_FIELDS: ReadonlySet<string> = new Set(['version', 'id', 'createdAt', 'updatedAt'])

const MAX_NOTE_LENGTH = 500
const MAX_VALUE_LENGTH = 200
const EMPTY_VALUE = '—'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asStatus(value: unknown): MemberStatus | null {
  return typeof value === 'string' && MEMBER_STATUSES.has(value) ? (value as MemberStatus) : null
}

/** Reduces a membership event's free-form `details` JSON to the two shapes the UI understands. */
export function summarizeMembershipEventDetails(details: unknown): {
  note: string | null
  statusChange: { before: MemberStatus; after: MemberStatus } | null
} {
  const record = isRecord(details) ? details : {}
  const before = asStatus(record['before'])
  const after = asStatus(record['after'])
  const rawNote = record['note']
  const note = typeof rawNote === 'string' && rawNote.trim() ? rawNote.trim().slice(0, MAX_NOTE_LENGTH) : null
  return { note, statusChange: before && after ? { before, after } : null }
}

function displayValue(key: string, value: unknown): string | null {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE
  if (key === 'status') return asStatus(value) ?? EMPTY_VALUE
  return typeof value === 'string' ? value.slice(0, MAX_VALUE_LENGTH) : null
}

/** Turns an audit `changes` payload into labelled field changes without exposing the raw JSON. */
export function summarizeMemberAuditChanges(changes: unknown): MemberDetailFieldChange[] {
  if (!isRecord(changes)) return []
  const before: Record<string, unknown> = isRecord(changes['before']) ? changes['before'] : {}
  const after: Record<string, unknown> = isRecord(changes['after']) ? changes['after'] : {}
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((key) => !HIDDEN_AUDIT_FIELDS.has(key))

  return keys.flatMap((key): MemberDetailFieldChange[] => {
    const label = AUDITED_MEMBER_FIELDS[key]
    if (!label) return [{ key, label: key, before: null, after: null, isStatus: false }]
    const previous = key in before ? displayValue(key, before[key]) : null
    const next = key in after ? displayValue(key, after[key]) : null
    if (previous !== null && previous === next) return []
    return [{ key, label, before: previous, after: next, isStatus: key === 'status' }]
  })
}
