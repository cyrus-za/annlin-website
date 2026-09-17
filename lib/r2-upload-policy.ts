export const MAX_R2_UPLOAD_BYTES = 100 * 1024 * 1024
export const MAX_R2_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024
export const R2_UPLOAD_SIGNATURE_TTL_SECONDS = 10 * 60
export const MIN_R2_UPLOAD_SECRET_LENGTH = 32

export const ALLOWED_R2_UPLOAD_TYPES = new Set([
  'application/pdf',
  'audio/mpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const R2_UPLOAD_EXTENSIONS_BY_TYPE = new Map<string, ReadonlySet<string>>([
  ['application/pdf', new Set(['pdf'])],
  ['audio/mpeg', new Set(['mp3'])],
  ['application/msword', new Set(['doc'])],
  [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    new Set(['docx']),
  ],
  ['application/vnd.ms-powerpoint', new Set(['ppt'])],
  [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    new Set(['pptx']),
  ],
  ['image/jpeg', new Set(['jpg', 'jpeg'])],
  ['image/png', new Set(['png'])],
  ['image/webp', new Set(['webp'])],
])

export function isAllowedR2Upload(mimeType: string, size: number) {
  return (
    ALLOWED_R2_UPLOAD_TYPES.has(mimeType) &&
    Number.isSafeInteger(size) &&
    size > 0 &&
    size <= (mimeType.startsWith('image/') ? MAX_R2_IMAGE_UPLOAD_BYTES : MAX_R2_UPLOAD_BYTES)
  )
}

export function isAllowedR2UploadFilename(filename: string, mimeType: string) {
  const extension = filename.match(/\.([a-z0-9]{1,8})$/i)?.[1]?.toLowerCase()
  return Boolean(extension && R2_UPLOAD_EXTENSIONS_BY_TYPE.get(mimeType)?.has(extension))
}

export function isAllowedR2UploadKey(key: string, mimeType: string) {
  const match = key.match(
    /^admin-uploads\/\d{4}\/(?:0[1-9]|1[0-2])\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-([a-z0-9][a-z0-9-]{0,80}\.[a-z0-9]{1,8})$/i
  )
  return Boolean(match?.[1] && isAllowedR2UploadFilename(match[1], mimeType))
}

export function r2UploadSignaturePayload(
  key: string,
  mimeType: string,
  size: number,
  expires: number
) {
  return `${key}\n${mimeType}\n${size}\n${expires}`
}

export function safeR2UploadFilename(value: string) {
  const extension = value.match(/\.[a-z0-9]{1,8}$/i)?.[0].toLowerCase() || ''
  const stem = value
    .replace(/\.[a-z0-9]{1,8}$/i, '')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return `${stem || 'dokument'}${extension}`
}
