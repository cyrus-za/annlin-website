'use client'

import Image from 'next/image'
import { Play } from 'lucide-react'
import { useState } from 'react'

export function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (isPlaying) {
    return (
      <div className="aspect-video bg-gray-100">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      className="group relative block aspect-video w-full overflow-hidden bg-gray-100 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onClick={() => setIsPlaying(true)}
      aria-label={`Speel ${title}`}
    >
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary shadow-lg transition-transform group-hover:scale-105">
        <Play className="ml-1 h-6 w-6 fill-current" aria-hidden="true" />
      </span>
    </button>
  )
}
