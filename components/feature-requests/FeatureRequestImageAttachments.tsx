'use client'

import * as React from 'react'
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FeatureRequestAttachmentDto, PendingFeatureRequestAttachment } from '@/lib/feature-requests'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGES = 5
const MAX_BYTES = 10 * 1024 * 1024

export function FeatureRequestAttachmentGallery({ attachments }: { attachments: FeatureRequestAttachmentDto[] }) {
  if (attachments.length === 0) return null
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {attachments.map((attachment) => (
        <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={attachment.url} alt={attachment.filename} className="aspect-video h-auto w-full object-cover transition group-hover:scale-[1.02]" />
          <span className="block truncate px-3 py-2 text-xs font-medium text-foreground">{attachment.filename}</span>
        </a>
      ))}
    </div>
  )
}

function clipboardFilename(file: File) {
  if (file.name) return file.name
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/webp' ? 'webp' : 'png'
  return `skermskoot-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`
}

export function FeatureRequestImageAttachments({
  value,
  onChange,
  disabled = false,
}: {
  value: PendingFeatureRequestAttachment[]
  onChange: (attachments: PendingFeatureRequestAttachment[]) => void
  disabled?: boolean
}) {
  const [uploading, setUploading] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [error, setError] = React.useState('')
  const uploadFiles = React.useCallback(async (files: File[]) => {
    const available = MAX_IMAGES - value.length
    if (available <= 0) {
      setError('Jy kan hoogstens vyf beelde aanheg.')
      return
    }
    const images = files.filter((file) => ACCEPTED_TYPES.has(file.type)).slice(0, available)
    if (images.length === 0) {
      setError('Kies ’n PNG-, JPG- of WebP-beeld.')
      return
    }
    const oversized = images.find((file) => file.size > MAX_BYTES)
    if (oversized) {
      setError(`${clipboardFilename(oversized)} is groter as 10 MB.`)
      return
    }

    setUploading(true)
    setError('')
    try {
      const uploaded: PendingFeatureRequestAttachment[] = []
      for (const sourceFile of images) {
        const filename = clipboardFilename(sourceFile)
        const file = sourceFile.name ? sourceFile : new File([sourceFile], filename, { type: sourceFile.type })
        const tokenResponse = await fetch('/api/r2-upload-token', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ filename, mimeType: file.type, size: file.size }),
        })
        const token = await tokenResponse.json() as { uploadUrl?: string; error?: string }
        if (!tokenResponse.ok || !token.uploadUrl) throw new Error(token.error || 'Kon nie oplaai begin nie')

        const uploadResponse = await fetch(token.uploadUrl, {
          method: 'PUT',
          headers: { 'content-type': file.type },
          body: file,
        })
        const result = await uploadResponse.json() as Omit<PendingFeatureRequestAttachment, 'filename'> & { error?: string }
        if (!uploadResponse.ok) throw new Error(result.error || 'Oplaai het misluk')
        uploaded.push({ ...result, filename })
      }
      onChange([...value, ...uploaded])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Oplaai het misluk')
    } finally {
      setUploading(false)
    }
  }, [onChange, value])

  React.useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      if (disabled || uploading) return
      const images = Array.from(event.clipboardData?.items ?? [])
        .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
        .flatMap((item) => item.getAsFile() ? [item.getAsFile()!] : [])
      if (images.length === 0) return
      event.preventDefault()
      void uploadFiles(images)
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [disabled, uploadFiles, uploading])

  return (
    <div className="space-y-3">
      <label
        className={cn(
          'flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition',
          dragging ? 'border-primary bg-primary/5' : 'border-stone-300 bg-stone-50 hover:border-primary/50',
          (disabled || uploading) && 'cursor-not-allowed opacity-60',
        )}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false) }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          if (!disabled && !uploading) void uploadFiles(Array.from(event.dataTransfer.files))
        }}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={disabled || uploading || value.length >= MAX_IMAGES}
          className="sr-only"
          onChange={(event) => {
            void uploadFiles(Array.from(event.target.files ?? []))
            event.currentTarget.value = ''
          }}
        />
        {uploading ? <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" /> : <ImagePlus className="mb-2 h-6 w-6 text-primary" />}
        <span className="text-sm font-medium">Plak, sleep of kies skermskote</span>
        <span className="mt-1 text-xs text-muted-foreground">Ctrl+V op Windows of Cmd+V op Mac; PNG, JPG of WebP tot 10 MB</span>
      </label>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((attachment) => (
            <figure key={attachment.pathname} className="group relative overflow-hidden rounded-lg border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachment.url} alt={attachment.filename} className="aspect-video h-auto w-full object-cover" />
              <figcaption className="truncate px-2 py-1.5 text-xs text-muted-foreground">{attachment.filename}</figcaption>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1.5 top-1.5 h-8 w-8"
                onClick={() => onChange(value.filter((item) => item.pathname !== attachment.pathname))}
                aria-label={`Verwyder ${attachment.filename}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </figure>
          ))}
        </div>
      )}
      {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Upload className="h-3.5 w-3.5" /> {value.length}/{MAX_IMAGES} beelde aangeheg</p>
    </div>
  )
}
