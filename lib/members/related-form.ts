import type { HouseholdRole, MemberContactType, MembershipEventType } from '@prisma/client'
import { MEMBER_RECORD_ID_PATTERN } from './create-form'
import { parseOptionalDate } from './edit-form'
import { CONTACT_TYPE_LABELS, HOUSEHOLD_ROLE_LABELS, MEMBERSHIP_EVENT_LABELS } from './labels'

export type MemberRelatedState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; field?: string }

export const MEMBER_RELATED_IDLE: MemberRelatedState = { status: 'idle' }
const CONTACT_TYPES = Object.keys(CONTACT_TYPE_LABELS) as MemberContactType[]
const HOUSEHOLD_ROLES = Object.keys(HOUSEHOLD_ROLE_LABELS) as HouseholdRole[]
const EVENT_TYPES = Object.keys(MEMBERSHIP_EVENT_LABELS) as MembershipEventType[]

function text(data: FormData, key: string) {
  const value = data.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function base(data: FormData) {
  const memberId = text(data, 'memberId')
  const version = Number(text(data, 'version'))
  if (!MEMBER_RECORD_ID_PATTERN.test(memberId) || !Number.isInteger(version) || version < 1) return null
  return { memberId, version }
}

function error(message: string, field?: string) {
  return { ok: false as const, state: { status: 'error' as const, message, field } }
}

export function parseWardForm(data: FormData) {
  const record = base(data)
  if (!record) return error('Herlaai die bladsy en probeer weer.')
  const wardId = text(data, 'wardId')
  if (wardId && !MEMBER_RECORD_ID_PATTERN.test(wardId)) return error('Kies ’n geldige wyk.', 'wardId')
  const startDate = parseOptionalDate(text(data, 'startDate'))
  if (!startDate) return error('Kies ’n geldige begindatum.', 'startDate')
  return { ok: true as const, value: { ...record, wardId: wardId || null, startDate } }
}

export function parseHouseholdForm(data: FormData) {
  const record = base(data)
  if (!record) return error('Herlaai die bladsy en probeer weer.')
  const householdId = text(data, 'householdId')
  if (householdId && !MEMBER_RECORD_ID_PATTERN.test(householdId)) return error('Kies ’n geldige huishouding.', 'householdId')
  const newHouseholdName = text(data, 'newHouseholdName').replace(/\s+/g, ' ')
  if (newHouseholdName.length > 160) return error('Die huishoudingnaam is te lank.', 'newHouseholdName')
  if (householdId && newHouseholdName) return error('Kies ’n bestaande huishouding of skep ’n nuwe een, nie albei nie.')
  const role = text(data, 'role')
  if (!(HOUSEHOLD_ROLES as string[]).includes(role)) return error('Kies ’n geldige rol.', 'role')
  const startDate = parseOptionalDate(text(data, 'startDate'))
  if (!startDate) return error('Kies ’n geldige begindatum.', 'startDate')
  return {
    ok: true as const,
    value: { ...record, householdId: householdId || null, newHouseholdName: newHouseholdName || null, role: role as HouseholdRole, isHead: text(data, 'isHead') === 'on', startDate },
  }
}

export function parseContactForm(data: FormData) {
  const record = base(data)
  if (!record) return error('Herlaai die bladsy en probeer weer.')
  const contactId = text(data, 'contactId')
  if (contactId && !MEMBER_RECORD_ID_PATTERN.test(contactId)) return error('Kontakpunt nie beskikbaar nie.')
  const operation = text(data, 'operation')
  if (operation === 'end') {
    if (!contactId) return error('Kies ’n kontakpunt om te verwyder.')
    return { ok: true as const, value: { ...record, operation: 'end' as const, contactId } }
  }
  const type = text(data, 'type')
  if (!(CONTACT_TYPES as string[]).includes(type)) return error('Kies ’n geldige kontaksoort.', 'type')
  const value = text(data, 'value').replace(/\s+/g, ' ')
  if (!value || value.length > 240) return error('Vul ’n geldige kontakwaarde in.', 'value')
  if (type === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return error('Vul ’n geldige e-posadres in.', 'value')
  if (['MOBILE', 'PHONE', 'WHATSAPP'].includes(type) && value.replace(/\D/g, '').length < 7) return error('Vul ’n geldige telefoonnommer in.', 'value')
  return {
    ok: true as const,
    value: { ...record, operation: 'save' as const, contactId: contactId || null, type: type as MemberContactType, value, isPreferred: text(data, 'isPreferred') === 'on', isVerified: text(data, 'isVerified') === 'on' },
  }
}

export function parseEventForm(data: FormData) {
  const record = base(data)
  if (!record) return error('Herlaai die bladsy en probeer weer.')
  const type = text(data, 'type')
  if (!(EVENT_TYPES as string[]).includes(type)) return error('Kies ’n geldige gebeurtenis.', 'type')
  if (type === 'STATUS_CHANGED') return error('Statusveranderings word by Kernbesonderhede aangebring.', 'type')
  const effectiveDate = parseOptionalDate(text(data, 'effectiveDate'))
  if (!effectiveDate) return error('Kies ’n geldige datum.', 'effectiveDate')
  const note = text(data, 'note')
  if (note.length > 1000) return error('Die nota mag hoogstens 1 000 karakters wees.', 'note')
  return { ok: true as const, value: { ...record, type: type as MembershipEventType, effectiveDate, note: note || null } }
}

export function relatedFailure(message = 'Die verandering kon nie gestoor word nie. Probeer weer.') : MemberRelatedState {
  return { status: 'error', message }
}
