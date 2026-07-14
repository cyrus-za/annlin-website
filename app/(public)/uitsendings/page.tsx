import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { YouTubeEmbed } from '@/components/public/YouTubeEmbed'
import { Calendar, ExternalLink, User } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uitsendings | Annlin Gemeente',
  description: 'Onlangse video uitsendings van eredienste by Gereformeerde Kerk Pretoria-Annlin.',
}

export const revalidate = 1800

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@gereformeerdekerkpretoria-813'
const YOUTUBE_FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4NmYnuAd0293vFhf1i-tpg'
const KERKDIENSTGEMIST_STATION_URL = 'https://kerkdienstgemist.nl/stations/1246-Gereformeerde-Kerk-Pretoria-Annlin'
const KERKDIENSTGEMIST_RECORDINGS_URL =
  'https://api.kerkdienstgemist.nl/api/v2/stations/1246/recordings?include=media&page=1&size=3'

type YouTubeUpload = {
  id: string
  title: string
  publishedAt: Date | null
  url: string
}

const YOUTUBE_FALLBACK_UPLOADS: YouTubeUpload[] = [
  {
    id: 'i5NjQfBrrMs',
    title: '12 Julie 2026 - Onthou jy die Here?',
    publishedAt: new Date('2026-07-12T20:25:54Z'),
    url: 'https://www.youtube.com/watch?v=i5NjQfBrrMs',
  },
  {
    id: '7WCe0dUKn7k',
    title: '5 Julie 2026 - Salig-sagmoedig ondanks die klipharde werklikheid',
    publishedAt: new Date('2026-07-05T19:48:01Z'),
    url: 'https://www.youtube.com/watch?v=7WCe0dUKn7k',
  },
  {
    id: 'lwIbOwua1y8',
    title: '28 Junie 2026 - Die (gemeente) pad, tussen Jerusalem en Jerigo',
    publishedAt: new Date('2026-06-28T19:40:17Z'),
    url: 'https://www.youtube.com/watch?v=lwIbOwua1y8',
  },
]

type KerkdienstgemistRecording = {
  id: string
  title: string
  description: string | null
  preachedAt: Date | null
  preacher: string | null
  url: string
  audioUrl: string | null
  duration: number | null
}

type KerkdienstgemistApiRecording = {
  id?: unknown
  attributes?: {
    title?: unknown
    description?: unknown
    artist?: unknown
    start_at?: unknown
  }
  relationships?: {
    media?: {
      data?: unknown
    }
  }
}

type KerkdienstgemistApiMedia = {
  id?: unknown
  attributes?: {
    duration?: unknown
    sources?: unknown
  }
}

type KerkdienstgemistApiResponse = {
  data?: unknown
  included?: unknown
}

function stripLeadingDate(value: string) {
  return value.replace(/^\s*\d{1,2}\s+[A-Za-zÀ-ÿ]+\s+\d{4}\s*[-–:]\s*/u, '').trim()
}

function decodeXmlEntities(value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function readXmlTag(entry: string, tagName: string) {
  const match = entry.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`))
  const value = match?.[1]
  return value ? decodeXmlEntities(value.trim()) : null
}

function formatDuration(seconds: number | null) {
  if (!seconds) {
    return null
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours} uur ${minutes.toString().padStart(2, '0')} min`
  }

  return `${minutes} min`
}

async function getLatestYouTubeUploads(): Promise<YouTubeUpload[]> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(YOUTUBE_FEED_URL, {
        headers: {
          Accept: 'application/atom+xml, application/xml, text/xml',
          'User-Agent': 'Annlin-Gemeente-Website/1.0',
        },
        next: { revalidate: 60 * 30 },
      })

      if (response.ok) {
        const xml = await response.text()
        const uploads = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
          .slice(0, 3)
          .map((match) => {
            const entry = match[1] ?? ''
            const id = readXmlTag(entry, 'yt:videoId') ?? ''
            const published = readXmlTag(entry, 'published')

            return {
              id,
              title: readXmlTag(entry, 'title') ?? 'YouTube uitsending',
              publishedAt: published ? new Date(published) : null,
              url: `https://www.youtube.com/watch?v=${id}`,
            }
          })
          .filter((upload) => upload.id)

        if (uploads.length > 0) {
          return uploads
        }
      }
    } catch {
      // Retry once before using the last known channel data below.
    }
  }

  return YOUTUBE_FALLBACK_UPLOADS
}

async function getKerkdienstgemistToken() {
  const configuredToken = process.env['KERKDIENSTGEMIST_API_TOKEN']

  if (configuredToken) {
    return configuredToken
  }

  try {
    const stationResponse = await fetch(KERKDIENSTGEMIST_STATION_URL, {
      next: { revalidate: 60 * 30 },
    })

    if (!stationResponse.ok) {
      return null
    }

    const stationHtml = await stationResponse.text()
    const frontendAssetUrl = stationHtml.match(
      /src="(https:\/\/frontend-assets\.kerkdienstgemist\.nl\/assets\/frontend-[^"]+\.js)"/
    )?.[1]

    if (!frontendAssetUrl) {
      return null
    }

    const assetResponse = await fetch(frontendAssetUrl, {
      next: { revalidate: 60 * 30 },
    })

    if (!assetResponse.ok) {
      return null
    }

    const asset = await assetResponse.text()
    return asset.match(/API_CREDENTIALS:"([^"]+)"/)?.[1] ?? null
  } catch {
    return null
  }
}

async function getLatestKerkdienstgemistRecordings(): Promise<KerkdienstgemistRecording[]> {
  const token = await getKerkdienstgemistToken()

  if (!token) {
    return []
  }

  try {
    const response = await fetch(KERKDIENSTGEMIST_RECORDINGS_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.api+json',
      },
      next: { revalidate: 60 * 30 },
    })

    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as KerkdienstgemistApiResponse
    const recordings = Array.isArray(payload.data) ? payload.data : []
    const mediaById = new Map(
      (Array.isArray(payload.included) ? payload.included : [])
        .map((item): [string, KerkdienstgemistApiMedia] | null => {
          const media = item as KerkdienstgemistApiMedia
          return typeof media.id === 'string' ? [media.id, media] : null
        })
        .filter((item): item is [string, KerkdienstgemistApiMedia] => Boolean(item))
    )

    return recordings
      .map((item): KerkdienstgemistRecording | null => {
        const recording = item as KerkdienstgemistApiRecording
        const id = typeof recording.id === 'string' ? recording.id : ''
        const attributes = recording.attributes
        const startAt = typeof attributes?.start_at === 'string' ? attributes.start_at : null
        const mediaReference = Array.isArray(recording.relationships?.media?.data)
          ? recording.relationships.media.data[0]
          : null
        const mediaId =
          mediaReference &&
          typeof mediaReference === 'object' &&
          'id' in mediaReference &&
          typeof mediaReference.id === 'string'
            ? mediaReference.id
            : null
        const media = mediaId ? mediaById.get(mediaId) : null
        const sources = Array.isArray(media?.attributes?.sources) ? media.attributes.sources : []
        const audioSource = sources.find(
          (source) =>
            source &&
            typeof source === 'object' &&
            'file' in source &&
            typeof source.file === 'string'
        )
        const audioUrl =
          audioSource &&
          typeof audioSource === 'object' &&
          'file' in audioSource &&
          typeof audioSource.file === 'string'
            ? audioSource.file
            : null
        const duration =
          typeof media?.attributes?.duration === 'number' ? media.attributes.duration : null

        if (!id || !attributes) {
          return null
        }

        return {
          id,
          title: typeof attributes.title === 'string' && attributes.title ? attributes.title : 'Kerkdiens opname',
          description:
            typeof attributes.description === 'string' && attributes.description
              ? attributes.description
              : null,
          preachedAt: startAt ? new Date(startAt) : null,
          preacher: typeof attributes.artist === 'string' && attributes.artist ? attributes.artist : null,
          url: `${KERKDIENSTGEMIST_STATION_URL}/events/recording/${id}`,
          audioUrl,
          duration,
        }
      })
      .filter((recording): recording is KerkdienstgemistRecording => Boolean(recording))
      .slice(0, 3)
  } catch {
    return []
  }
}

export default async function UitsendingsPage() {
  const [youtubeUploads, kerkdienstgemistRecordings] = await Promise.all([
    getLatestYouTubeUploads(),
    getLatestKerkdienstgemistRecordings(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 max-w-3xl">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Onlangse video uitsendings
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Kyk na onlangse eredienste en verwante uitsendings. Indien u na 'n spesifieke uitsending soek wat nie hier verskyn nie, kontak gerus die kerkkantoor.
          </p>
        </div>

        <section className="mb-12">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Nuutste YouTube uitsendings</h2>
              <p className="mt-2 text-muted-foreground">
                Die drie mees onlangse opnames vanaf ons YouTube-kanaal.
              </p>
            </div>
            <Button asChild variant="outline">
              <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                YouTube-kanaal
              </a>
            </Button>
          </div>

          {youtubeUploads.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {youtubeUploads.map((upload) => (
                <Card key={upload.id} className="overflow-hidden">
                  <YouTubeEmbed videoId={upload.id} title={upload.title} />
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-base leading-tight">
                      {stripLeadingDate(upload.title)}
                    </CardTitle>
                    {upload.publishedAt ? (
                      <CardDescription>
                        {upload.publishedAt.toLocaleDateString('af-ZA', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <a href={upload.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Maak oop op YouTube
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>YouTube uitsendings</CardTitle>
                <CardDescription>
                  Ons kon nie die jongste YouTube-video's outomaties laai nie. Gebruik intussen die kanaalskakel.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>

        <section className="mb-12">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Laaste Kerkdienstgemist opnames</h2>
              <p className="mt-2 text-muted-foreground">
                Opnames wat deur Kerkdienstgemist beskikbaar gestel word.
              </p>
            </div>
            <Button asChild variant="outline">
              <a href={KERKDIENSTGEMIST_STATION_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Kerkdienstgemist
              </a>
            </Button>
          </div>

          {kerkdienstgemistRecordings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {kerkdienstgemistRecordings.map((recording) => (
                <Card key={recording.id} className="flex h-full flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-base leading-tight">
                      {recording.title}
                    </CardTitle>
                    {recording.description ? (
                      <CardDescription className="line-clamp-2">
                        {recording.description}
                      </CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent className="mt-auto space-y-4">
                    <div className="space-y-2">
                      {recording.preachedAt ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {recording.preachedAt.toLocaleDateString('af-ZA', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      ) : null}
                      {recording.preacher ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          {recording.preacher}
                        </div>
                      ) : null}
                      {formatDuration(recording.duration) ? (
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(recording.duration)}
                        </div>
                      ) : null}
                    </div>

                    {recording.audioUrl ? (
                      <audio controls preload="none" className="w-full">
                        <source src={recording.audioUrl} type="audio/mpeg" />
                        Jou blaaier ondersteun nie die klankspeler nie.
                      </audio>
                    ) : null}

                    <Button asChild variant={recording.audioUrl ? 'ghost' : 'outline'} className="w-full">
                      <a href={recording.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Maak oop op Kerkdienstgemist
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Kerkdienstgemist opnames</CardTitle>
                <CardDescription>
                  Ons kon nie die jongste Kerkdienstgemist-opnames outomaties laai nie. Gebruik intussen die stasieskakel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <a href={KERKDIENSTGEMIST_STATION_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Maak Kerkdienstgemist oop
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
