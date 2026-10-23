'use client'

export type R2UploadedImage = {
  url: string
  pathname: string
  size: number
  mimeType: string
}

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function uploadR2Image(file: File): Promise<R2UploadedImage> {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Kies ’n PNG-, JPG- of WebP-prentjie.')
  }

  const tokenResponse = await fetch('/api/r2-upload-token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
  })
  const token = await tokenResponse.json() as { uploadUrl?: string; error?: string }
  if (!tokenResponse.ok || !token.uploadUrl) {
    throw new Error(token.error || 'Kon nie oplaai begin nie')
  }

  const uploadResponse = await fetch(token.uploadUrl, {
    method: 'PUT',
    headers: { 'content-type': file.type },
    body: file,
  })
  const result = await uploadResponse.json() as R2UploadedImage & { error?: string }
  if (!uploadResponse.ok) {
    throw new Error(result.error || 'Oplaai het misluk')
  }

  return result
}
