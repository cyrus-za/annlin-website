'use client'

import * as React from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ServiceGroupGalleryPhotoInput } from '@/lib/service-group-gallery'
import { cn } from '@/lib/utils'

const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxPhotos = 20
const maxBytes = 10 * 1024 * 1024

function normalizeOrder(photos: ServiceGroupGalleryPhotoInput[]) {
  return photos.map((photo, displayOrder) => ({ ...photo, displayOrder }))
}

export function ServiceGroupGalleryEditor({
  value,
  onChange,
}: {
  value: ServiceGroupGalleryPhotoInput[]
  onChange: (photos: ServiceGroupGalleryPhotoInput[]) => void
}) {
  const [uploading, setUploading] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [error, setError] = React.useState('')

  const uploadFiles = React.useCallback(async (files: File[]) => {
    const available = maxPhotos - value.length
    const images = files.filter((file) => acceptedTypes.has(file.type)).slice(0, available)
    if (available <= 0) {
      setError('Jy kan hoogstens 20 foto’s byvoeg.')
      return
    }
    if (images.length === 0) {
      setError('Kies JPG-, PNG- of WebP-foto’s.')
      return
    }
    const oversized = images.find((file) => file.size > maxBytes)
    if (oversized) {
      setError(`${oversized.name} is groter as 10 MB.`)
      return
    }

    setUploading(true)
    setError('')
    try {
      const uploaded: ServiceGroupGalleryPhotoInput[] = []
      for (const file of images) {
        const tokenResponse = await fetch('/api/r2-upload-token', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
        })
        const token = await tokenResponse.json() as { uploadUrl?: string; error?: string }
        if (!tokenResponse.ok || !token.uploadUrl) throw new Error(token.error || 'Kon nie oplaai begin nie')

        const uploadResponse = await fetch(token.uploadUrl, {
          method: 'PUT',
          headers: { 'content-type': file.type },
          body: file,
        })
        const result = await uploadResponse.json() as { url?: string; pathname?: string; error?: string }
        if (!uploadResponse.ok || !result.url || !result.pathname) {
          throw new Error(result.error || 'Oplaai het misluk')
        }
        uploaded.push({
          url: result.url,
          pathname: result.pathname,
          filename: file.name,
          mimeType: file.type as ServiceGroupGalleryPhotoInput['mimeType'],
          size: file.size,
          alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          caption: '',
          displayOrder: value.length + uploaded.length,
        })
      }
      onChange(normalizeOrder([...value, ...uploaded]))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Oplaai het misluk')
    } finally {
      setUploading(false)
    }
  }, [onChange, value])

  const updatePhoto = (index: number, values: Partial<ServiceGroupGalleryPhotoInput>) => {
    onChange(value.map((photo, photoIndex) => photoIndex === index ? { ...photo, ...values } : photo))
  }
  const movePhoto = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= value.length) return
    const reordered = [...value]
    const [photo] = reordered.splice(index, 1)
    if (!photo) return
    reordered.splice(target, 0, photo)
    onChange(normalizeOrder(reordered))
  }

  return (
    <div className="space-y-4">
      <label
        className={cn(
          'flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition',
          dragging ? 'border-primary bg-primary/5' : 'border-stone-300 bg-stone-50 hover:border-primary/50',
          uploading && 'cursor-not-allowed opacity-60',
        )}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false) }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          if (!uploading) void uploadFiles(Array.from(event.dataTransfer.files))
        }}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={uploading || value.length >= maxPhotos}
          className="sr-only"
          onChange={(event) => {
            void uploadFiles(Array.from(event.currentTarget.files || []))
            event.currentTarget.value = ''
          }}
        />
        {uploading ? <Loader2 className="mb-2 h-7 w-7 animate-spin text-primary" /> : <ImagePlus className="mb-2 h-7 w-7 text-primary" />}
        <span className="font-medium">Sleep foto’s hierheen of klik om te kies</span>
        <span className="mt-1 text-sm text-muted-foreground">JPG, PNG of WebP; hoogstens 10 MB per foto</span>
      </label>

      {value.map((photo, index) => (
        <div key={photo.id || photo.pathname || photo.url} className="grid gap-4 rounded-xl border border-stone-200 bg-white p-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt="" className="aspect-[4/3] h-auto w-full rounded-lg bg-stone-100 object-cover" />
          <div className="min-w-0 space-y-3">
            <Input
              value={photo.caption || ''}
              onChange={(event) => updatePhoto(index, { caption: event.target.value })}
              placeholder="Onderskrif (opsioneel)"
              aria-label={`Onderskrif vir foto ${index + 1}`}
            />
            <Input
              value={photo.alt}
              onChange={(event) => updatePhoto(index, { alt: event.target.value })}
              placeholder="Beskryf die foto vir skermlesers"
              aria-label={`Alternatiewe teks vir foto ${index + 1}`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => movePhoto(index, -1)} disabled={index === 0} aria-label="Skuif foto op">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => movePhoto(index, 1)} disabled={index === value.length - 1} aria-label="Skuif foto af">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" variant="destructive" size="sm" className="ml-auto" onClick={() => onChange(normalizeOrder(value.filter((_, photoIndex) => photoIndex !== index)))}>
                <Trash2 className="mr-2 h-4 w-4" />
                Verwyder
              </Button>
            </div>
          </div>
        </div>
      ))}

      {error ? <p role="alert" className="text-sm font-medium text-red-700">{error}</p> : null}
      <p className="text-sm text-muted-foreground">
        {value.length === 0
          ? 'Die fotogalery verskyn eers op die publieke blad wanneer minstens een foto gestoor is.'
          : `${value.length} van ${maxPhotos} foto’s. Gebruik die pylknoppies om die volgorde te verander.`}
      </p>
    </div>
  )
}
