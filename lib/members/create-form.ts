import type { MemberStatus } from '@prisma/client'
import { MEMBER_NAME_MAX_LENGTH, isMemberStatus, normalizeName, parseOptionalDate } from './edit-form'
import { MEMBER_STATUS_LABELS } from './labels'

export const MEMBER_CREATE_FIELDS = ['firstNames', 'preferredName', 'lastName', 'birthDate', 'status', 'wardId'] as const
export type MemberCreateField = (typeof MEMBER_CREATE_FIELDS)[number]
export type MemberCreateFailureCode = 'INVALID' | 'NOT_FOUND' | 'UNAVAILABLE'
export type MemberCreateState =
  | { status: 'idle' }
  | { status: 'error'; code: MemberCreateFailureCode; message: string; field?: MemberCreateField }

export const MEMBER_CREATE_IDLE: MemberCreateState = { status: 'idle' }
export const MEMBER_RECORD_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function fieldError(field: MemberCreateField, message: string): { ok: false; state: MemberCreateState } {
  return { ok: false, state: { status: 'error', code: 'INVALID', message, field } }
}

export function describeMemberCreateFailure(code: MemberCreateFailureCode, detail?: string): MemberCreateState {
  const messages: Record<MemberCreateFailureCode, string> = {
    INVALID: 'Kontroleer die invoer en probeer weer.',
    NOT_FOUND: 'Die lidmaatregister of gekose opsie is nie beskikbaar nie.',
    UNAVAILABLE: 'Die register is tydelik nie beskikbaar nie. Probeer later weer.',
  }
  return { status: 'error', code, message: code === 'INVALID' && detail?.trim() ? detail.trim() : messages[code] }
}

export function parseMemberCreateForm(formData: FormData) {
  const firstNames = normalizeName(text(formData, 'firstNames'))
  if (!firstNames) return fieldError('firstNames', 'Voorname is verpligtend.')
  if (firstNames.length > MEMBER_NAME_MAX_LENGTH) return fieldError('firstNames', `Voorname mag hoogstens ${MEMBER_NAME_MAX_LENGTH} karakters wees.`)

  const preferredName = normalizeName(text(formData, 'preferredName'))
  if (preferredName.length > MEMBER_NAME_MAX_LENGTH) return fieldError('preferredName', `Noemnaam mag hoogstens ${MEMBER_NAME_MAX_LENGTH} karakters wees.`)

  const lastName = normalizeName(text(formData, 'lastName'))
  if (!lastName) return fieldError('lastName', 'Van is verpligtend.')
  if (lastName.length > MEMBER_NAME_MAX_LENGTH) return fieldError('lastName', `Van mag hoogstens ${MEMBER_NAME_MAX_LENGTH} karakters wees.`)

  const birthDate = parseOptionalDate(text(formData, 'birthDate'))
  if (birthDate === undefined || (birthDate && birthDate > new Date())) {
    return fieldError('birthDate', 'Vul ’n geldige geboortedatum in wat nie in die toekoms is nie.')
  }

  const status = text(formData, 'status')
  if (!isMemberStatus(status) || status === 'ARCHIVED') return fieldError('status', 'Kies ’n geldige status.')

  const wardId = text(formData, 'wardId').trim()
  if (wardId && !MEMBER_RECORD_ID_PATTERN.test(wardId)) return fieldError('wardId', 'Kies ’n geldige wyk.')

  return {
    ok: true as const,
    value: {
      firstNames,
      preferredName: preferredName || null,
      lastName,
      birthDate,
      status: status as Exclude<MemberStatus, 'ARCHIVED'>,
      wardId: wardId || null,
    },
  }
}

export function memberCreateStatusOptions() {
  return (Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[])
    .filter((status) => status !== 'ARCHIVED')
    .map((status) => ({ value: status, label: MEMBER_STATUS_LABELS[status] }))
}
