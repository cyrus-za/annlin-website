import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-config'
import {
  isAllowedR2UploadFilename,
  isAllowedR2Upload,
  MIN_R2_UPLOAD_SECRET_LENGTH,
  R2_UPLOAD_SIGNATURE_TTL_SECONDS,
  r2UploadSignaturePayload,
  safeR2UploadFilename,
} from '@/lib/r2-upload-policy'

function base64Url(bytes: ArrayBuffer) {
  return Buffer.from(bytes).toString('base64url')
}

async function signature(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return base64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)))
}

function validWorkerUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const { user } = await requireAuth()
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Onvoldoende regte' }, { status: 403 })

  const workerUrl = process.env['R2_UPLOAD_WORKER_URL']
  const secret = process.env['R2_UPLOAD_SECRET']
  if (
    !workerUrl ||
    !validWorkerUrl(workerUrl) ||
    !secret ||
    secret.length < MIN_R2_UPLOAD_SECRET_LENGTH
  ) {
    return NextResponse.json({ error: 'R2-oplaai is nie opgestel nie' }, { status: 503 })
  }

  let body: { filename?: string; mimeType?: string; size?: number }
  try {
    body = await request.json() as typeof body
  } catch {
    return NextResponse.json({ error: 'Ongeldige oplaai-versoek' }, { status: 400 })
  }
  const filename = safeR2UploadFilename(body.filename || '')
  const mimeType = body.mimeType || ''
  const size = Number(body.size || 0)
  if (
    !isAllowedR2Upload(mimeType, size) ||
    !isAllowedR2UploadFilename(filename, mimeType)
  ) {
    return NextResponse.json({ error: 'Ongeldige lêertipe of lêergrootte' }, { status: 400 })
  }

  const now = new Date()
  const key = `admin-uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}-${filename}`
  const expires = Math.floor(Date.now() / 1000) + R2_UPLOAD_SIGNATURE_TTL_SECONDS
  const payload = r2UploadSignaturePayload(key, mimeType, size, expires)
  const params = new URLSearchParams({ key, type: mimeType, size: String(size), expires: String(expires), signature: await signature(secret, payload) })

  return NextResponse.json({ uploadUrl: `${workerUrl.replace(/\/+$/, '')}?${params}` })
}
