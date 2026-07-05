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

export default async function UitsendingsPage() {
  const videos = await prisma.sermonVideo.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ isFeatured: 'desc' }, { preachedAt: 'desc' }, { createdAt: 'desc' }],
    take: 24,
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

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
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
                <a href="https://www.youtube.com/channel/UC4NmYnuAd0293vFhf1i-tpg" target="_blank" rel="noopener noreferrer">
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
