import type { MemberStatus } from '@prisma/client'
import { MEMBER_STATUS_LABELS } from './labels'

/**
 * Pure helpers for the controlled member edit form.
 *
 * Everything here runs without a database so it can be verified in isolation. The server action
 * uses `parseMemberEditForm` before it calls `updateMember`, which remains the final authority on
 * validation, authorization and optimistic concurrency.
 */

export const MEMBER_EDIT_FIELDS = ['firstNames', 'preferredName', 'lastName', 'status'] as const
export type MemberEditField = (typeof MEMBER_EDIT_FIELDS)[number]

export type MemberEditValues = {
  firstNames: string
  preferredName: string
  lastName: string
  status: MemberStatus
}

export type MemberEditFailureCode = 'INVALID' | 'CONFLICT' | 'NOT_FOUND' | 'UNAVAILABLE'

export type MemberEditState =
  | { status: 'idle' }
  | { status: 'success'; message: string; version: number }
  | { status: 'error'; code: MemberEditFailureCode; message: string; field?: MemberEditField }

export const MEMBER_EDIT_IDLE: MemberEditState = { status: 'idle' }

export type ParsedMemberEdit = {
  memberId: string
  version: number
  input: {
    firstNames: string
    preferredName: string | null
    lastName: string
    status: MemberStatus
  }
}

export const MEMBER_NAME_MAX_LENGTH = 120
const MEMBER_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/
const MEMBER_STATUSES = Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[]

const FAILURE_MESSAGES: Record<MemberEditFailureCode, string> = {
  INVALID: 'Kontroleer die invoer en probeer weer.',
  CONFLICT: 'Iemand het hierdie rekord intussen verander. Herlaai die bladsy om die nuutste waardes te sien voordat jy weer stoor.',
  NOT_FOUND: 'Hierdie rekord is nie beskikbaar nie.',
  UNAVAILABLE: 'Die register is tydelik nie beskikbaar nie. Probeer later weer.',
}

function formText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

/** Collapses internal whitespace the same way the command layer does, so dirty checks match storage. */
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function isMemberStatus(value: unknown): value is MemberStatus {
  return typeof value === 'string' && (MEMBER_STATUSES as string[]).includes(value)
}

function fieldError(field: MemberEditField, message: string): { ok: false; state: MemberEditState } {
  return { ok: false, state: { status: 'error', code: 'INVALID', message, field } }
}

/** Maps a command/authorization failure to a user-facing state without leaking internals. */
export function describeMemberEditFailure(code: MemberEditFailureCode, detail?: string): MemberEditState {
  const message = code === 'INVALID' && detail?.trim() ? detail.trim() : FAILURE_MESSAGES[code]
  return { status: 'error', code, message }
}

/**
 * Validates the submitted form. Identifier and version problems are reported generically so the
 * browser cannot probe record existence or learn internal structure from the messages.
 */
export function parseMemberEditForm(formData: FormData): { ok: true; value: ParsedMemberEdit } | { ok: false; state: MemberEditState } {
  const memberId = formText(formData, 'memberId')
  if (!MEMBER_ID_PATTERN.test(memberId)) return { ok: false, state: describeMemberEditFailure('NOT_FOUND') }

  const rawVersion = formText(formData, 'version').trim()
  const version = /^\d{1,9}$/.test(rawVersion) ? Number(rawVersion) : NaN
  if (!Number.isInteger(version) || version < 1) return { ok: false, state: describeMemberEditFailure('CONFLICT') }

  const firstNames = normalizeName(formText(formData, 'firstNames'))
  if (!firstNames) return fieldError('firstNames', 'Voorname is verpligtend.')
  if (firstNames.length > MEMBER_NAME_MAX_LENGTH) return fieldError('firstNames', `Voorname mag hoogstens ${MEMBER_NAME_MAX_LENGTH} karakters wees.`)

  const preferredName = normalizeName(formText(formData, 'preferredName'))
  if (preferredName.length > MEMBER_NAME_MAX_LENGTH) return fieldError('preferredName', `Noemnaam mag hoogstens ${MEMBER_NAME_MAX_LENGTH} karakters wees.`)

  const lastName = normalizeName(formText(formData, 'lastName'))
  if (!lastName) return fieldError('lastName', 'Van is verpligtend.')
  if (lastName.length > MEMBER_NAME_MAX_LENGTH) return fieldError('lastName', `Van mag hoogstens ${MEMBER_NAME_MAX_LENGTH} karakters wees.`)

  const status = formText(formData, 'status')
  if (!isMemberStatus(status)) return fieldError('status', 'Kies ’n geldige status.')

  return {
    ok: true,
    value: {
      memberId,
      version,
      input: { firstNames, preferredName: preferredName || null, lastName, status },
    },
  }
}

/**
 * Statuses the form may set. Archiving has its own semantics (archivedAt, reactivation history),
 * so ARCHIVED is only offered when the record already carries it.
 */
export function memberStatusOptions(current: MemberStatus): Array<{ value: MemberStatus; label: string }> {
  return MEMBER_STATUSES
    .filter((status) => status !== 'ARCHIVED' || current === 'ARCHIVED')
    .map((status) => ({ value: status, label: MEMBER_STATUS_LABELS[status] }))
}

/** True when the draft differs from the stored values after normalisation. */
export function hasMemberEditChanges(draft: MemberEditValues, current: MemberEditValues): boolean {
  return (
    normalizeName(draft.firstNames) !== normalizeName(current.firstNames) ||
    normalizeName(draft.preferredName) !== normalizeName(current.preferredName) ||
    normalizeName(draft.lastName) !== normalizeName(current.lastName) ||
    draft.status !== current.status
  )
}
