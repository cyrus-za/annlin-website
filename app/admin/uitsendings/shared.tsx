import Link from 'next/link'
import type { SermonVideo } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { saveSermonVideo } from '../_actions/content'

function datetimeLocal(value?: Date | null) {
  if (!value) return ''
  const offset = value.getTimezoneOffset()
  const local = new Date(value.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

export function SermonVideoForm({ video }: { video?: SermonVideo }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{video ? 'Redigeer Uitsending' : 'Nuwe Uitsending'}</h1>
        <p className="mt-2 text-gray-600">Bestuur handmatige video-inskrywings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Uitsending Besonderhede</CardTitle>
          <CardDescription>Video URL, bron, datum en status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveSermonVideo} className="space-y-5">
            {video && <input type="hidden" name="id" value={video.id} />}
            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input id="title" name="title" defaultValue={video?.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input id="videoUrl" name="videoUrl" defaultValue={video?.videoUrl} required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="preachedAt">Datum</Label>
                <Input id="preachedAt" name="preachedAt" type="datetime-local" defaultValue={datetimeLocal(video?.preachedAt)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="preacher">Prediker</Label>
                <Input id="preacher" name="preacher" defaultValue={video?.preacher || ''} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Beskrywing</Label>
              <Textarea id="description" name="description" defaultValue={video?.description || ''} rows={5} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="source">Bron</Label>
                <select id="source" name="source" defaultValue={video?.source || 'YOUTUBE'} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="YOUTUBE">YouTube</option>
                  <option value="KERKDIENSTGEMIST">Kerkdienstgemist</option>
                  <option value="OTHER">Ander</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={video?.status || 'PUBLISHED'} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="PUBLISHED">Gepubliseer</option>
                  <option value="DRAFT">Konsep</option>
                  <option value="ARCHIVED">Argief</option>
                </select>
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm font-medium">
                <input type="checkbox" name="isFeatured" defaultChecked={video?.isFeatured || false} />
                Uitgelig
              </label>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Stoor Uitsending</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/uitsendings">Kanselleer</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
