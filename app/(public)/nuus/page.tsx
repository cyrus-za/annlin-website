import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Calendar, Newspaper } from 'lucide-react'
import { prisma } from '@/lib/db'
import { createArticleExcerpt } from '@/lib/public-content'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuus | Annlin Gemeente',
  description: 'Nuus en aankondigings van Gereformeerde Kerk Pretoria-Annlin.',
}

export const revalidate = 300

function formatDate(date: Date | null) {
  if (!date) return null

  return new Intl.DateTimeFormat('af-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default async function NewsPage() {
  const latestCategoryNames = ['Die Fontein - Weekblad', 'Die Fontein - Maandblad', 'Liturgie']
  const [articles, latestPublications] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: [{ contentDate: 'desc' }, { title: 'asc' }],
    }),
    Promise.all(
      latestCategoryNames.map((name) =>
        prisma.readingMaterial.findFirst({
          where: { status: 'PUBLISHED', isArchived: false, category: { name } },
          include: { category: true },
          orderBy: [{ contentDate: 'desc' }, { title: 'asc' }],
        })
      )
    ),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Newspaper className="h-6 w-6 text-amber-700" />
            </div>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Nuus</h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Gemeente-nuus en aankondigings.
            </p>
          </div>
        </div>
      </section>

      {latestPublications.some(Boolean) ? (
        <section className="border-b bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Jongste publikasies</h2>
                <p className="mt-2 text-muted-foreground">Die jongste Weekblad, Maandblad en liturgie op een plek.</p>
              </div>
              <Button asChild variant="outline"><Link href="/leesstof">Besoek Leesstof</Link></Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {latestPublications.filter((item) => item !== null).map((item) => (
                <article key={item.id} className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-amber-800">{item.category.name}</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
                  {item.showDate ? <p className="mt-2 text-sm text-muted-foreground">{formatDate(item.contentDate)}</p> : null}
                  <Button asChild className="mt-5 w-full"><Link href={`/leesstof/${item.id}`}>Lees publikasie <BookOpen className="ml-2 h-4 w-4" /></Link></Button>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {articles.map((article) => (
                  <Card key={article.id}>
                    <CardHeader>
                      <CardTitle className="text-amber-900">{article.title}</CardTitle>
                      {article.showDate ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(article.contentDate)}
                        </div>
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <p className="overflow-hidden break-words text-base leading-7 text-muted-foreground">
                        {createArticleExcerpt(article.excerpt || article.content, 220)}
                      </p>
                      <Button asChild variant="outline">
                        <Link href={`/nuus/${article.slug}`}>
                          Lees volledige artikel
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-xl font-semibold text-foreground">Geen nuus beskikbaar nie</h2>
              <p className="mt-2 text-muted-foreground">
                Die nuwe webwerf het nog geen gepubliseerde nuusitems nie.
              </p>
              <Button asChild className="mt-6">
                <Link href="/kontak">Kontak die kerkkantoor</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
