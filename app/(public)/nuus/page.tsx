import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Calendar, Newspaper } from 'lucide-react'
import { PublicationCategoryBadge } from '@/components/public/PublicationCategoryBadge'
import { prisma } from '@/lib/db'
import { createArticleExcerpt } from '@/lib/public-content'
import Link from 'next/link'
import type { Metadata } from 'next'
import Image from 'next/image'

const newsHeroImage = '/migrated/diensgroepe/fontein-redaksie.png'

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

function publicationPreviewUrl(fileUrl: string) {
  return `${fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`
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
      <section className="relative flex min-h-[24rem] items-end overflow-hidden bg-stone-900 sm:min-h-[30rem]">
        <Image
          src={newsHeroImage}
          alt=""
          fill
          preload
          sizes="100vw"
          quality={80}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-stone-950/15" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 sm:pb-16 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm">
              <Newspaper className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold sm:text-5xl">Nuus</h1>
            <p className="mt-6 text-xl text-stone-100">Gemeentenuus en aankondigings.</p>
          </div>
        </div>
      </section>

      {latestPublications.some(Boolean) ? (
        <section className="border-b bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Nuutste publikasies</h2>
                <p className="mt-2 text-muted-foreground">Die nuutste Weekblad, Maandblad en liturgie op een plek.</p>
              </div>
              <Button asChild variant="outline"><Link href="/leesstof">Besoek Leesstof</Link></Button>
            </div>
            <div className="mt-6 grid items-start gap-5 md:grid-cols-3">
              {latestPublications.filter((item) => item !== null).map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm">
                  {item.fileType === 'PDF' && item.fileUrl ? (
                    <div className="relative aspect-[210/297] overflow-hidden border-b border-stone-200 bg-stone-100">
                      <iframe
                        src={publicationPreviewUrl(item.fileUrl)}
                        title={`Eerste bladsy van ${item.title}`}
                        loading="lazy"
                        scrolling="no"
                        tabIndex={-1}
                        className="pointer-events-none absolute inset-0 h-full w-full border-0"
                      />
                      <Link
                        href={`/leesstof/${item.id}`}
                        aria-label={`Lees ${item.title}`}
                        className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      />
                    </div>
                  ) : item.description ? (
                    <div className="border-b border-stone-200 bg-white p-5">
                      <p className="line-clamp-8 min-h-44 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                        {createArticleExcerpt(item.description, 520)}
                      </p>
                    </div>
                  ) : null}

                  <div className="p-5">
                    <PublicationCategoryBadge category={item.category.name} />
                    <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">{item.title}</h3>
                    {item.showDate ? <p className="mt-2 text-sm text-muted-foreground">{formatDate(item.contentDate)}</p> : null}
                    <Button asChild className="mt-5 w-full"><Link href={`/leesstof/${item.id}`}>Lees publikasie <BookOpen className="ml-2 h-4 w-4" /></Link></Button>
                  </div>
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
