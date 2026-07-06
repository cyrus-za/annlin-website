import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ExternalLink, User } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uitsendings | Annlin Gemeente',
  description: 'Onlangse video uitsendings van eredienste by Gereformeerde Kerk Pretoria-Annlin.',
}

export const dynamic = 'force-dynamic'

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@gereformeerdekerkpretoria-813'
const YOUTUBE_FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4NmYnuAd0293vFhf1i-tpg'

type YouTubeUpload = {
  id: string
  title: string
  publishedAt: Date | null
  url: string
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
  return match ? decodeXmlEntities(match[1].trim()) : null
}

async function getLatestYouTubeUploads(): Promise<YouTubeUpload[]> {
  try {
    const response = await fetch(YOUTUBE_FEED_URL, {
      next: { revalidate: 60 * 30 },
    })

    if (!response.ok) {
      return []
    }

    const xml = await response.text()
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
      .slice(0, 3)
      .map((match) => {
        const entry = match[1]
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
  } catch {
    return []
  }
}

export default async function UitsendingsPage() {
  const [videos, youtubeUploads] = await Promise.all([
    prisma.sermonVideo.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ isFeatured: 'desc' }, { preachedAt: 'desc' }, { createdAt: 'desc' }],
      take: 24,
    }),
    getLatestYouTubeUploads(),
  ])

  const externalLinks = videos.filter((video) => {
    const isGenericYouTubeChannel =
      video.source === 'YOUTUBE' &&
      !video.preachedAt &&
      (video.title.toLowerCase().includes('youtube') || video.videoUrl.includes('youtube.com/@'))

    return !isGenericYouTubeChannel
  })

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
                  <div className="aspect-video bg-gray-100">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${upload.id}`}
                      title={upload.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-base leading-tight">
                      {upload.title}
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

        {externalLinks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {externalLinks.map((video) => (
              <Card key={video.id} className="flex h-full flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-lg leading-tight">
                        {video.title}
                      </CardTitle>
                      {video.description ? (
                        <CardDescription className="line-clamp-2">
                          {video.description}
                        </CardDescription>
                      ) : null}
                    </div>
                    {video.isFeatured ? (
                      <Badge variant="secondary" className="bg-amber-100 text-foreground">
                        Uitgelig
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent className="mt-auto space-y-4">
                  <div className="space-y-2">
                    {video.preachedAt ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {video.preachedAt.toLocaleDateString('af-ZA', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    ) : null}
                    {video.preacher ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        {video.preacher}
                      </div>
                    ) : null}
                  </div>

                  <Button asChild className="w-full bg-amber-700 hover:bg-amber-800">
                    <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Kyk uitsending
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Uitsendings word nog gelaai</CardTitle>
              <CardDescription>
                Die nuwe webwerf se uitsendinglys is nog leeg. Gebruik intussen die bestaande kanale hieronder.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="https://kerkdienstgemist.nl/stations/1246-Gereformeerde-Kerk-Pretoria-Annlin" target="_blank" rel="noopener noreferrer">
                  Kerkdienstgemist
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
