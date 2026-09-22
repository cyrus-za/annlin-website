'use client'

import * as React from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Images } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { PublicServiceGroupPhoto } from '@/lib/service-group-gallery'

export function ServiceGroupGallery({
  photos,
  groupName,
}: {
  photos: PublicServiceGroupPhoto[]
  groupName: string
}) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const activePhoto = photos[activeIndex] || photos[0]

  React.useEffect(() => {
    if (activeIndex >= photos.length) setActiveIndex(0)
  }, [activeIndex, photos.length])

  if (!activePhoto) return null

  const showControls = photos.length > 1
  const selectPrevious = () => setActiveIndex((activeIndex - 1 + photos.length) % photos.length)
  const selectNext = () => setActiveIndex((activeIndex + 1) % photos.length)

  return (
    <section
      aria-labelledby="diensgroep-fotos"
      className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 px-6 pb-4 pt-6">
        <h2 id="diensgroep-fotos" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Images className="h-5 w-5 text-primary" />
          Foto&apos;s
        </h2>
        {showControls ? (
          <span className="text-sm text-muted-foreground">
            {activeIndex + 1} van {photos.length}
          </span>
        ) : null}
      </div>

      <div className="relative aspect-[4/3] bg-stone-100">
        <Image
          key={activePhoto.id}
          src={activePhoto.url}
          alt={activePhoto.alt || `${groupName} foto ${activeIndex + 1}`}
          fill
          sizes="(min-width: 1024px) 20rem, 100vw"
          className="object-contain"
        />
        {showControls ? (
          <>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
              onClick={selectPrevious}
              aria-label="Vorige foto"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
              onClick={selectNext}
              aria-label="Volgende foto"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        ) : null}
      </div>

      {activePhoto.caption ? (
        <p className="px-6 py-4 text-sm leading-6 text-muted-foreground">
          {activePhoto.caption}
        </p>
      ) : null}

      {showControls ? (
        <div className="flex gap-2 overflow-x-auto border-t border-stone-100 p-3">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-stone-100 transition ${
                index === activeIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-stone-400'
              }`}
              aria-label={`Wys foto ${index + 1}${photo.caption ? `: ${photo.caption}` : ''}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
