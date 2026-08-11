#!/usr/bin/env tsx

import assert from 'node:assert/strict'
import worker from '../cloudflare/r2-upload-worker'
import {
  MAX_R2_UPLOAD_BYTES,
  R2_UPLOAD_SIGNATURE_TTL_SECONDS,
  r2UploadSignaturePayload,
} from '../lib/r2-upload-policy'

const SECRET = 'test-secret-that-is-at-least-thirty-two-characters'
const ORIGIN = 'https://annlin.venter.pro'
const KEY = 'admin-uploads/2026/08/00000000-0000-4000-8000-000000000000-toets.pdf'
const MIME_TYPE = 'application/pdf'

function base64Url(bytes: ArrayBuffer) {
  return Buffer.from(bytes).toString('base64url')
}

async function signature(payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return base64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)))
}

function mockEnv() {
  const writes: Array<{ key: string; options: unknown }> = []
  return {
    writes,
    env: {
      MEDIA: {
        async put(key: string, _value: ReadableStream | null, options: unknown) {
          writes.push({ key, options })
        },
      },
      ALLOWED_ORIGINS: `${ORIGIN},https://annlin.co.za`,
      PUBLIC_BASE_URL: 'https://media.example.test',
      UPLOAD_SECRET: SECRET,
    },
  }
}

function failingEnv() {
  return {
    MEDIA: {
      async put() {
        throw new Error('simulated R2 failure')
      },
    },
    ALLOWED_ORIGINS: ORIGIN,
    PUBLIC_BASE_URL: 'https://media.example.test',
    UPLOAD_SECRET: SECRET,
  }
}

async function uploadRequest(options: {
  size?: number
  expires?: number
  suppliedSignature?: string
  body?: string | null
  contentLength?: number
} = {}) {
  const size = options.size ?? 3
  const expires = options.expires ?? Math.floor(Date.now() / 1000) + 300
  const payload = r2UploadSignaturePayload(KEY, MIME_TYPE, size, expires)
  const suppliedSignature = options.suppliedSignature ?? await signature(payload)
  const params = new URLSearchParams({
    key: KEY,
    type: MIME_TYPE,
    size: String(size),
    expires: String(expires),
    signature: suppliedSignature,
  })
  const body = options.body === undefined ? 'pdf' : options.body
  return new Request(`https://upload.example.test/?${params}`, {
    method: 'PUT',
    headers: {
      origin: ORIGIN,
      'content-type': MIME_TYPE,
      'content-length': String(options.contentLength ?? (body?.length || 0)),
    },
    body,
  })
}

async function main() {
  {
    const { env, writes } = mockEnv()
    const response = await worker.fetch(await uploadRequest(), env)
    assert.equal(response.status, 200)
    assert.equal(writes.length, 1)
    assert.equal(writes[0]?.key, KEY)
    assert.deepEqual(writes[0]?.options, {
      httpMetadata: {
        contentType: MIME_TYPE,
        contentDisposition: 'inline',
        cacheControl: 'public, max-age=31536000, immutable',
      },
    })
    assert.equal(response.headers.get('access-control-allow-origin'), ORIGIN)
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  }

  {
    const { env, writes } = mockEnv()
    const response = await worker.fetch(
      await uploadRequest({ suppliedSignature: 'invalid-signature' }),
      env
    )
    assert.equal(response.status, 401)
    assert.equal(writes.length, 0)
  }

  {
    const { env } = mockEnv()
    const response = await worker.fetch(
      await uploadRequest({ size: MAX_R2_UPLOAD_BYTES + 1 }),
      env
    )
    assert.equal(response.status, 400)
  }

  {
    const { env, writes } = mockEnv()
    const expires = Math.floor(Date.now() / 1000) + 300
    const invalidKey = 'admin-uploads/../../aanval.pdf'
    const payload = r2UploadSignaturePayload(invalidKey, MIME_TYPE, 3, expires)
    const params = new URLSearchParams({
      key: invalidKey,
      type: MIME_TYPE,
      size: '3',
      expires: String(expires),
      signature: await signature(payload),
    })
    const response = await worker.fetch(
      new Request(`https://upload.example.test/?${params}`, {
        method: 'PUT',
        headers: {
          origin: ORIGIN,
          'content-type': MIME_TYPE,
          'content-length': '3',
        },
        body: 'pdf',
      }),
      env
    )
    assert.equal(response.status, 400)
    assert.equal(writes.length, 0)
  }

  {
    const { env, writes } = mockEnv()
    const expires = Math.floor(Date.now() / 1000) + 300
    const invalidKey = KEY.replace(/\.pdf$/, '.mp3')
    const payload = r2UploadSignaturePayload(invalidKey, MIME_TYPE, 3, expires)
    const params = new URLSearchParams({
      key: invalidKey,
      type: MIME_TYPE,
      size: '3',
      expires: String(expires),
      signature: await signature(payload),
    })
    const response = await worker.fetch(
      new Request(`https://upload.example.test/?${params}`, {
        method: 'PUT',
        headers: {
          origin: ORIGIN,
          'content-type': MIME_TYPE,
          'content-length': '3',
        },
        body: 'pdf',
      }),
      env
    )
    assert.equal(response.status, 400)
    assert.equal(writes.length, 0)
  }

  {
    const { env } = mockEnv()
    const response = await worker.fetch(await uploadRequest(), {
      ...env,
      UPLOAD_SECRET: '',
    })
    assert.equal(response.status, 503)
  }

  {
    const response = await worker.fetch(await uploadRequest(), failingEnv())
    assert.equal(response.status, 502)
    assert.equal(response.headers.get('access-control-allow-origin'), ORIGIN)
  }

  {
    const { env } = mockEnv()
    const response = await worker.fetch(
      await uploadRequest({ expires: Math.floor(Date.now() / 1000) - 1 }),
      env
    )
    assert.equal(response.status, 401)
  }

  {
    const { env } = mockEnv()
    const response = await worker.fetch(
      await uploadRequest({
        expires: Math.floor(Date.now() / 1000) + R2_UPLOAD_SIGNATURE_TTL_SECONDS + 60,
      }),
      env
    )
    assert.equal(response.status, 401)
  }

  {
    const { env } = mockEnv()
    const response = await worker.fetch(
      await uploadRequest({ contentLength: 2 }),
      env
    )
    assert.equal(response.status, 400)
  }

  {
    const { env } = mockEnv()
    const response = await worker.fetch(
      new Request('https://upload.example.test', {
        method: 'OPTIONS',
        headers: { origin: 'https://attacker.example' },
      }),
      env
    )
    assert.equal(response.status, 403)
    assert.equal(response.headers.get('access-control-allow-origin'), null)
  }

  {
    const { env } = mockEnv()
    const response = await worker.fetch(
      new Request('https://upload.example.test', {
        method: 'OPTIONS',
        headers: { origin: ORIGIN },
      }),
      env
    )
    assert.equal(response.status, 204)
    assert.equal(response.headers.get('access-control-allow-origin'), ORIGIN)
  }

  console.log('R2 upload Worker contract checks passed.')
}

void main()
