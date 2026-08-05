import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-config'

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'audio/mpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
])

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

function safeFilename(value: string) {
  const extension = value.match(/\.[a-z0-9]{1,8}$/i)?.[0].toLowerCase() || ''
  const stem = value
    .replace(/\.[a-z0-9]{1,8}$/i, '')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return `${stem || 'dokument'}${extension}`
}

export async function POST(request: NextRequest) {
  const { user } = await requireAuth()
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Onvoldoende regte' }, { status: 403 })

  const workerUrl = process.env.R2_UPLOAD_WORKER_URL
  const secret = process.env.R2_UPLOAD_SECRET
  if (!workerUrl || !secret) return NextResponse.json({ error: 'R2-oplaai is nie opgestel nie' }, { status: 503 })

  const body = await request.json() as { filename?: string; mimeType?: string; size?: number }
  const filename = safeFilename(body.filename || '')
  const mimeType = body.mimeType || ''
  const size = Number(body.size || 0)
  if (!ALLOWED_TYPES.has(mimeType) || !Number.isSafeInteger(size) || size <= 0 || size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Ongeldige lêertipe of lêergrootte' }, { status: 400 })
  }

  const now = new Date()
  const key = `admin-uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}-${filename}`
  const expires = Math.floor(Date.now() / 1000) + 10 * 60
  const payload = `${key}\n${mimeType}\n${size}\n${expires}`
  const params = new URLSearchParams({ key, type: mimeType, size: String(size), expires: String(expires), signature: await signature(secret, payload) })

  return NextResponse.json({ uploadUrl: `${workerUrl.replace(/\/+$/, '')}?${params}` })
}
