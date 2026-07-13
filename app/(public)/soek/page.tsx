import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, CalendarDays, FileText, Search, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CONTENT_PAGE_DEFINITIONS } from '@/lib/content-page-definitions'
import { prisma } from '@/lib/db'
import { createArticleExcerpt, createExcerpt, createServiceGroupExcerpt } from '@/lib/public-content'

export const metadata: Metadata = {
  title: 'Soek | Annlin Gemeente',
  description: 'Soek deur Annlin Gemeente se nuus, diensgroepe, leesstof en webbladsye.',
}

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>
}

type SearchResult = {
  href: string
  title: string
  description: string
  type: 'Bladsy' | 'Diensgroep' | 'Nuus' | 'Leesstof'
}

const resultIcons = {
  Bladsy: FileText,
  Diensgroep: Users,
  Nuus: CalendarDays,
  Leesstof: BookOpen,
}

function searchableDefinitionText(definition: (typeof CONTENT_PAGE_DEFINITIONS)[number]) {
  return `${definition.title} ${definition.description} ${JSON.stringify(definition.sections)}`.toLocaleLowerCase('af')
}

async function searchSite(query: string): Promise<SearchResult[]> {
  const contains = { contains: query, mode: 'insensitive' as const }
  const [serviceGroups, articles, readingMaterials] = await Promise.all([
    prisma.serviceGroup.findMany({
      where: {
        isActive: true,
        OR: [{ name: contains }, { description: contains }, { contactPerson: contains }],
      },
      orderBy: { displayOrder: 'asc' },
      take: 20,
    }),
    prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [{ title: contains }, { excerpt: contains }, { content: contains }],
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    }),
    prisma.readingMaterial.findMany({
      where: {
        AND: [
          { NOT: { id: { startsWith: 'wp-archive-' } } },
          { NOT: { id: { startsWith: 'wp-media-' } } },
          { OR: [{ title: contains }, { description: contains }] },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
  ])

  const normalizedQuery = query.toLocaleLowerCase('af')
  const pages: SearchResult[] = CONTENT_PAGE_DEFINITIONS.filter((definition) =>
    searchableDefinitionText(definition).includes(normalizedQuery)
  ).map((definition) => ({
    href: definition.route,
    title: definition.title,
    description: definition.description,
    type: 'Bladsy',
  }))

  return [
    ...pages,
    ...serviceGroups.map((group): SearchResult => ({
      href: `/diensgroepe/${group.slug}`,
      title: group.name,
      description: createServiceGroupExcerpt(group.description, group.name, 180),
      type: 'Diensgroep',
    })),
    ...articles.map((article): SearchResult => ({
      href: `/nuus/${article.slug}`,
      title: article.title,
      description: createArticleExcerpt(article.excerpt || article.content, 180),
      type: 'Nuus',
    })),
    ...readingMaterials.map((material): SearchResult => ({
      href: `/leesstof/${material.id}`,
      title: material.title,
      description: createExcerpt(material.description || 'Leesstof en toerusting.', 180),
      type: 'Leesstof',
    })),
  ]
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q
  const query = rawQuery?.trim() || ''
  const results = query.length >= 2 ? await searchSite(query) : []

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="border-b bg-white py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <Search className="mt-1 h-9 w-9 shrink-0 text-amber-800" />
            <div>
              <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Soek</h1>
              {query ? (
                <p className="mt-4 text-lg text-muted-foreground">
                  {results.length} {results.length === 1 ? 'resultaat' : 'resultate'} vir “{query}”
                </p>
              ) : (
                <p className="mt-4 text-lg text-muted-foreground">Tik ’n soekterm in die kieslys bo.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {query.length === 1 ? (
            <p className="rounded-md border border-stone-200 bg-white p-6 text-muted-foreground">
              Gebruik ten minste twee karakters om te soek.
            </p>
          ) : results.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {results.map((result) => {
                const Icon = resultIcons[result.type]
                return (
                  <Card key={`${result.type}-${result.href}`} className="flex h-full flex-col">
                    <CardHeader>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-800">
                        <Icon className="h-4 w-4" />
                        {result.type}
                      </div>
                      <CardTitle className="text-2xl">{result.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <p className="line-clamp-4 flex-1 text-muted-foreground">{result.description}</p>
                      <Button asChild variant="outline" className="mt-6 self-start">
                        <Link href={result.href}>Maak oop</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : query ? (
            <div className="rounded-md border border-stone-200 bg-white p-8 text-center">
              <h2 className="text-2xl font-semibold text-foreground">Geen resultate gevind nie</h2>
              <p className="mt-3 text-muted-foreground">Probeer ’n ander woord of gaan terug na die tuisblad.</p>
              <Button asChild className="mt-6">
                <Link href="/">Terug na tuisblad</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
