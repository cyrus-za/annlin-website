import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAuth } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { deleteSermonVideo } from '../_actions/content'

export default async function AdminBroadcastsPage() {
  await requireAuth()
  const videos = await prisma.sermonVideo.findMany({
    orderBy: [{ preachedAt: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Uitsendings Bestuur</h1>
          <p className="mt-2 text-gray-600">Bestuur handmatige video-inskrywings op die uitsendingsblad.</p>
        </div>
        <Button asChild>
          <Link href="/admin/uitsendings/new">
            <Plus className="mr-2 h-4 w-4" />
            Voeg Uitsending By
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uitsendings</CardTitle>
          <CardDescription>{videos.length} inskrywing{videos.length === 1 ? '' : 's'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {videos.map((video) => (
            <div key={video.id} className="flex flex-col gap-3 rounded-md border p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-gray-900">{video.title}</h2>
                  <Badge variant={video.status === 'PUBLISHED' ? 'default' : 'secondary'}>{video.status}</Badge>
                  <Badge variant="outline">{video.source}</Badge>
                  {video.isFeatured && <Badge>Uitgelig</Badge>}
                </div>
                <p className="text-sm text-gray-600">{video.videoUrl}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/uitsendings/${video.id}`}>Redigeer</Link>
                </Button>
                <form action={deleteSermonVideo}>
                  <input type="hidden" name="id" value={video.id} />
                  <Button variant="destructive" size="sm" type="submit">Verwyder</Button>
                </form>
              </div>
            </div>
          ))}
          {videos.length === 0 && (
            <p className="py-8 text-center text-gray-600">Geen handmatige uitsendings gevind nie.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
