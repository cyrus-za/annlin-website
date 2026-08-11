import {
  isAllowedR2UploadKey,
  isAllowedR2Upload,
  MIN_R2_UPLOAD_SECRET_LENGTH,
  R2_UPLOAD_SIGNATURE_TTL_SECONDS,
  r2UploadSignaturePayload,
} from '../lib/r2-upload-policy'

type MediaBucket = {
  put(
    key: string,
    value: ReadableStream | null,
    options: {
      httpMetadata: {
        contentType: string
        contentDisposition: string
        cacheControl: string
      }
    }
  ): Promise<unknown>
}

interface Env {
  MEDIA: MediaBucket
  ALLOWED_ORIGINS: string
  PUBLIC_BASE_URL: string
  UPLOAD_SECRET: string
}

function corsHeaders(request: Request, env: Env) {
  const origin = request.headers.get('origin') || ''
  const allowed = env.ALLOWED_ORIGINS.split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const allowedOrigin = allowed.includes(origin) ? origin : ''
  return {
    ...(allowedOrigin ? { 'access-control-allow-origin': allowedOrigin } : {}),
    'access-control-allow-methods': 'PUT, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  }
}

function jsonResponse(request: Request, env: Env, body: { error: string }, status: number) {
  return Response.json(body, {
    status,
    headers: { ...corsHeaders(request, env), 'cache-control': 'no-store' },
  })
}

function base64Url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
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

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index++) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env)
    if (request.method === 'OPTIONS') {
      if (!request.headers.get('origin') || !('access-control-allow-origin' in cors)) {
        return jsonResponse(request, env, { error: 'Origin not allowed' }, 403)
      }
      return new Response(null, { status: 204, headers: cors })
    }
    if (request.method !== 'PUT') {
      return jsonResponse(request, env, { error: 'Method not allowed' }, 405)
    }

    if (!env.UPLOAD_SECRET || env.UPLOAD_SECRET.length < MIN_R2_UPLOAD_SECRET_LENGTH) {
      return jsonResponse(request, env, { error: 'Upload service is not configured' }, 503)
    }

    const url = new URL(request.url)
    const key = url.searchParams.get('key') || ''
    const mimeType = url.searchParams.get('type') || ''
    const size = Number(url.searchParams.get('size') || 0)
    const expires = Number(url.searchParams.get('expires') || 0)
    const suppliedSignature = url.searchParams.get('signature') || ''
    const payload = r2UploadSignaturePayload(key, mimeType, size, expires)
    const now = Math.floor(Date.now() / 1000)

    if (!isAllowedR2UploadKey(key, mimeType) || !isAllowedR2Upload(mimeType, size)) {
      return jsonResponse(request, env, { error: 'Invalid upload request' }, 400)
    }
    if (expires < now || expires > now + R2_UPLOAD_SIGNATURE_TTL_SECONDS) {
      return jsonResponse(request, env, { error: 'Upload request expired' }, 401)
    }
    if (!safeEqual(suppliedSignature, await signature(env.UPLOAD_SECRET, payload))) {
      return jsonResponse(request, env, { error: 'Invalid upload signature' }, 401)
    }
    if (
      !request.body ||
      Number(request.headers.get('content-length') || 0) !== size ||
      request.headers.get('content-type') !== mimeType
    ) {
      return jsonResponse(request, env, { error: 'Upload metadata does not match the file' }, 400)
    }

    try {
      await env.MEDIA.put(key, request.body, {
        httpMetadata: {
          contentType: mimeType,
          contentDisposition: 'inline',
          cacheControl: 'public, max-age=31536000, immutable',
        },
      })
    } catch {
      return jsonResponse(request, env, { error: 'Object storage upload failed' }, 502)
    }

    const encodedPath = key.split('/').map(encodeURIComponent).join('/')
    return Response.json(
      {
        url: `${env.PUBLIC_BASE_URL.replace(/\/+$/, '')}/${encodedPath}`,
        pathname: key,
        size,
        mimeType,
      },
      {
        headers: {
          ...cors,
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
        },
      }
    )
  },
}

export default worker
