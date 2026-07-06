import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Newspaper } from 'lucide-react'
import { prisma } from '@/lib/db'
import { createExcerpt } from '@/lib/public-content'
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
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  })

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

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {articles.map((article) => (
                <Card key={article.id}>
                  <CardHeader>
                    <CardTitle className="text-amber-900">{article.title}</CardTitle>
                    {formatDate(article.publishedAt) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(article.publishedAt)}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <p className="text-base leading-7 text-muted-foreground">
                      {article.excerpt || createExcerpt(article.content, 220)}
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
                <Link href="/kontakbesonderhede">Kontak die kerkkantoor</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
