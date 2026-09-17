/**
 * Builds the links for the register -> detail -> register journey.
 *
 * Only the register's own `soek` and `bladsy` parameters are carried along, and every return target
 * is rebuilt as a same-origin `/admin/lidmate` path, so a crafted URL can never redirect elsewhere.
 */
export type RegisterListParams = { soek?: string | undefined; bladsy?: string | undefined }

const MAX_SEARCH_LENGTH = 100

export function registerListQuery(params: RegisterListParams): string {
  const query = new URLSearchParams()
  const search = params.soek?.trim().slice(0, MAX_SEARCH_LENGTH)
  if (search) query.set('soek', search)
  const page = Number(params.bladsy)
  if (Number.isInteger(page) && page > 1) query.set('bladsy', String(page))
  const encoded = query.toString()
  return encoded ? `?${encoded}` : ''
}

export function memberDetailHref(memberId: string, params: RegisterListParams): string {
  return `/admin/lidmate/${encodeURIComponent(memberId)}${registerListQuery(params)}`
}

export function registerHref(params: RegisterListParams, focusMemberId?: string): string {
  const anchor = focusMemberId ? `#${memberRowId(focusMemberId)}` : ''
  return `/admin/lidmate${registerListQuery(params)}${anchor}`
}

export function memberRowId(memberId: string): string {
  return `lid-${encodeURIComponent(memberId)}`
}
