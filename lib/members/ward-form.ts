import { MEMBER_RECORD_ID_PATTERN } from './create-form'
import { parseOptionalDate } from './edit-form'

export type WardFormField = 'wardId' | 'version' | 'code' | 'name' | 'activeFrom' | 'elderId' | 'elderStartDate'
export type WardFormState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; field?: WardFormField }

export const WARD_FORM_IDLE: WardFormState = { status: 'idle' }

function text(data: FormData, key: string) {
  const value = data.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function fieldError(field: WardFormField, message: string) {
  return { ok: false as const, state: { status: 'error' as const, message, field } }
}

function common(data: FormData) {
  const code = text(data, 'code').replace(/\s+/g, ' ')
  if (!code || code.length > 30) return fieldError('code', 'Wykkode is verpligtend en mag hoogstens 30 karakters wees.')
  const name = text(data, 'name').replace(/\s+/g, ' ')
  if (!name || name.length > 120) return fieldError('name', 'Wyknaam is verpligtend en mag hoogstens 120 karakters wees.')
  const activeFrom = parseOptionalDate(text(data, 'activeFrom'))
  if (!activeFrom) return fieldError('activeFrom', 'Kies ’n geldige begindatum.')
  const elderId = text(data, 'elderId')
  if (elderId && !MEMBER_RECORD_ID_PATTERN.test(elderId)) return fieldError('elderId', 'Kies ’n geldige ouderling.')
  const elderStartDate = parseOptionalDate(text(data, 'elderStartDate'))
  if (elderId && !elderStartDate) return fieldError('elderStartDate', 'Kies wanneer die ouderling se dienstyd begin.')
  if (!elderId && text(data, 'elderStartDate') && !elderStartDate) return fieldError('elderStartDate', 'Kies ’n geldige datum.')
  if (elderId && elderStartDate && elderStartDate < activeFrom) return fieldError('elderStartDate', 'Die ouderling se dienstyd kan nie voor die wyk se begindatum begin nie.')
  return { ok: true as const, value: { code, name, activeFrom, elderId: elderId || null, elderStartDate: elderStartDate ?? activeFrom } }
}

export function parseCreateWardForm(data: FormData) {
  return common(data)
}

export function parseUpdateWardForm(data: FormData) {
  const wardId = text(data, 'wardId')
  if (!MEMBER_RECORD_ID_PATTERN.test(wardId)) return fieldError('wardId', 'Wyk nie beskikbaar nie.')
  const rawVersion = text(data, 'version')
  const version = /^\d{1,9}$/.test(rawVersion) ? Number(rawVersion) : NaN
  if (!Number.isInteger(version) || version < 1) return fieldError('version', 'Herlaai die bladsy en probeer weer.')
  const parsed = common(data)
  if (!parsed.ok) return parsed
  return { ok: true as const, value: { wardId, version, ...parsed.value } }
}

export function wardFailure(message = 'Die wyk kon nie gestoor word nie. Probeer weer.'): WardFormState {
  return { status: 'error', message }
}
