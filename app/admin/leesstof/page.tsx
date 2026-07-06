import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAuth } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { deleteReadingMaterial } from '../_actions/content'

export default async function AdminReadingPage() {
  await requireAuth()
  const materials = await prisma.readingMaterial.findMany({
    include: { category: true },
    orderBy: [{ updatedAt: 'desc' }, { title: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leesstof Bestuur</h1>
          <p className="mt-2 text-gray-600">Skep en wysig publieke leesstof en argiefinhoud.</p>
        </div>
        <Button asChild>
          <Link href="/admin/leesstof/new">
            <Plus className="mr-2 h-4 w-4" />
            Voeg Leesstof By
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leesstof</CardTitle>
          <CardDescription>{materials.length} item{materials.length === 1 ? '' : 's'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {materials.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-md border p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-gray-900">{item.title}</h2>
                  <Badge variant="outline">{item.category.name}</Badge>
                  {item.fileType && <Badge variant="secondary">{item.fileType}</Badge>}
                </div>
                <p className="line-clamp-2 text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/leesstof/${item.id}`}>Redigeer</Link>
                </Button>
                <form action={deleteReadingMaterial}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button variant="destructive" size="sm" type="submit">Verwyder</Button>
                </form>
              </div>
            </div>
          ))}
          {materials.length === 0 && (
            <p className="py-8 text-center text-gray-600">Geen leesstof gevind nie.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
