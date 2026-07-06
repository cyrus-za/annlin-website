import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAuth } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { deleteArticle } from '../_actions/content'

export default async function AdminNewsPage() {
  await requireAuth()
  const articles = await prisma.article.findMany({
    include: { category: true },
    orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuus Bestuur</h1>
          <p className="mt-2 text-gray-600">Skep en wysig publieke nuus en aankondigings.</p>
        </div>
        <Button asChild>
          <Link href="/admin/nuus/new">
            <Plus className="mr-2 h-4 w-4" />
            Skep Artikel
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Artikels</CardTitle>
          <CardDescription>{articles.length} artikel{articles.length === 1 ? '' : 's'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="flex flex-col gap-3 rounded-md border p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-gray-900">{article.title}</h2>
                  <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {article.status === 'PUBLISHED' ? 'Gepubliseer' : 'Konsep'}
                  </Badge>
                  <Badge variant="outline">{article.category.name}</Badge>
                </div>
                <p className="text-sm text-gray-600">{article.slug}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/nuus/${article.id}`}>Redigeer</Link>
                </Button>
                <form action={deleteArticle}>
                  <input type="hidden" name="id" value={article.id} />
                  <Button variant="destructive" size="sm" type="submit">Verwyder</Button>
                </form>
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <p className="py-8 text-center text-gray-600">Geen artikels gevind nie.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
