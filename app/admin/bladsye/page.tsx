import { ArrowRight, ExternalLink, FileText } from 'lucide-react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { CONTENT_PAGE_DEFINITIONS } from '@/lib/content-page-definitions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminContentPagesPage() {
  await requireAdmin()
  const storedPages = await prisma.contentPage.findMany({
    where: {
      slug: { in: CONTENT_PAGE_DEFINITIONS.map((definition) => definition.slug) },
    },
  })
  const pagesBySlug = new Map(storedPages.map((page) => [page.slug, page]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Publieke Bladsye</h1>
        <p className="mt-2 text-gray-600">Wysig die vaste teks van die tuis-, oor-, kontak- en beleidsbladsye.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {CONTENT_PAGE_DEFINITIONS.map((definition) => {
          const storedPage = pagesBySlug.get(definition.slug)
          return (
            <Card key={definition.slug} className="flex h-full flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-amber-700" />
                      {definition.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{definition.description}</CardDescription>
                  </div>
                  <Badge variant={storedPage?.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                    {storedPage?.status === 'PUBLISHED' ? 'Gepubliseer' : 'Verstekinhoud'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <p className="font-mono text-xs text-gray-500">{definition.route}</p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/admin/bladsye/${definition.slug}`}>
                      Redigeer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={definition.route} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Bekyk bladsy
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
