type MediaBucket = {
  put(
    key: string,
    value: ReadableStream | null,
    options: { httpMetadata: { contentType: string; contentDisposition: string } }
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
  const allowed = env.ALLOWED_ORIGINS.split(',').map((value) => value.trim())
  return {
    'access-control-allow-origin': allowed.includes(origin) ? origin : allowed[0] || '',
    'access-control-allow-methods': 'PUT, OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'Origin',
  }
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
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'PUT') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors })

    const url = new URL(request.url)
    const key = url.searchParams.get('key') || ''
    const mimeType = url.searchParams.get('type') || ''
    const size = Number(url.searchParams.get('size') || 0)
    const expires = Number(url.searchParams.get('expires') || 0)
    const suppliedSignature = url.searchParams.get('signature') || ''
    const payload = `${key}\n${mimeType}\n${size}\n${expires}`

    if (!key.startsWith('admin-uploads/') || !mimeType || !Number.isSafeInteger(size) || size <= 0) {
      return Response.json({ error: 'Invalid upload request' }, { status: 400, headers: cors })
    }
    if (expires < Math.floor(Date.now() / 1000)) {
      return Response.json({ error: 'Upload request expired' }, { status: 401, headers: cors })
    }
    if (!safeEqual(suppliedSignature, await signature(env.UPLOAD_SECRET, payload))) {
      return Response.json({ error: 'Invalid upload signature' }, { status: 401, headers: cors })
    }
    if (Number(request.headers.get('content-length') || 0) !== size || request.headers.get('content-type') !== mimeType) {
      return Response.json({ error: 'Upload metadata does not match the file' }, { status: 400, headers: cors })
    }

    await env.MEDIA.put(key, request.body, {
      httpMetadata: { contentType: mimeType, contentDisposition: 'inline' },
    })

    const encodedPath = key.split('/').map(encodeURIComponent).join('/')
    return Response.json(
      {
        url: `${env.PUBLIC_BASE_URL.replace(/\/+$/, '')}/${encodedPath}`,
        pathname: key,
        size,
        mimeType,
      },
      { headers: { ...cors, 'cache-control': 'no-store' } }
    )
  },
}

export default worker
