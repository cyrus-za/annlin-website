'use client'

import * as React from 'react'
import { CheckCircle2, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type UploadedFile = {
  url: string
  pathname: string
  size: number
  mimeType: string
  filename: string
}

export function ResourceFileUpload({ defaultUrl = '' }: { defaultUrl?: string }) {
  const [uploaded, setUploaded] = React.useState<UploadedFile | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [error, setError] = React.useState('')
  const [uploading, setUploading] = React.useState(false)

  async function uploadFile(file: File) {
    setUploading(true)
    setError('')
    setProgress(0)
    try {
      const tokenResponse = await fetch('/api/r2-upload-token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
      })
      const token = await tokenResponse.json() as { uploadUrl?: string; error?: string }
      if (!tokenResponse.ok || !token.uploadUrl) throw new Error(token.error || 'Kon nie oplaai begin nie')

      const result = await new Promise<Omit<UploadedFile, 'filename'>>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', token.uploadUrl || '')
        xhr.setRequestHeader('content-type', file.type)
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100))
        }
        xhr.onerror = () => reject(new Error('Die netwerkverbinding het tydens oplaai misluk'))
        xhr.onload = () => {
          const response = JSON.parse(xhr.responseText || '{}') as Omit<UploadedFile, 'filename'> & { error?: string }
          if (xhr.status < 200 || xhr.status >= 300) reject(new Error(response.error || 'Oplaai het misluk'))
          else resolve(response)
        }
        xhr.send(file)
      })
      setUploaded({ ...result, filename: file.name })
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Oplaai het misluk')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="grid gap-3">
      <Label htmlFor="resource-file">Laai dokument of klank op</Label>
      <Input
        id="resource-file"
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp3"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void uploadFile(file)
        }}
      />
      {uploading ? (
        <div className="space-y-2" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-stone-200"><div className="h-full bg-amber-700 transition-[width]" style={{ width: `${progress}%` }} /></div>
          <p className="text-sm text-muted-foreground">Laai tans op: {progress}%</p>
        </div>
      ) : null}
      {uploaded ? (
        <p className="flex items-center gap-2 text-sm font-medium text-green-800"><CheckCircle2 className="h-4 w-4" /> {uploaded.filename} is gereed</p>
      ) : null}
      {error ? <p className="text-sm font-medium text-red-700" role="alert">{error}</p> : null}
      <div className="grid gap-2">
        <Label htmlFor="fileUrl">Of gebruik ’n bestaande lêer-URL</Label>
        {uploaded ? (
          <>
            <Input id="fileUrl" value={uploaded.url} readOnly />
            <input type="hidden" name="fileUrl" value={uploaded.url} />
          </>
        ) : (
          <Input id="fileUrl" name="fileUrl" defaultValue={defaultUrl} />
        )}
      </div>
      <input type="hidden" name="uploadedPathname" value={uploaded?.pathname || ''} />
      <input type="hidden" name="uploadedFilename" value={uploaded?.filename || ''} />
      <input type="hidden" name="uploadedMimeType" value={uploaded?.mimeType || ''} />
      <input type="hidden" name="uploadedSize" value={uploaded?.size || ''} />
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Upload className="h-3.5 w-3.5" /> PDF, Word, PowerPoint of MP3; maksimum 100 MB.</p>
    </div>
  )
}
