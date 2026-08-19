import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Download, Newspaper } from 'lucide-react'
import { PublicationCategoryBadge } from '@/components/public/PublicationCategoryBadge'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PageHero } from '@/components/public/PageHero'

const newsHeroImage = '/images/news-hero-die-fontein.png'

export const metadata: Metadata = {
  title: 'Nuus | Annlin Gemeente',
  description: 'Nuus en aankondigings van Gereformeerde Kerk Pretoria-Annlin.',
}

export const revalidate = 300

function formatDate(date: Date | null, category?: string) {
  if (!date) return null

  return new Intl.DateTimeFormat('af-ZA', {
    day: category?.includes('Maandblad') ? undefined : '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function publicationPreviewUrl(fileUrl: string) {
  return `${fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`
}

export default async function NewsPage() {
  const latestPublications = (await Promise.all(
    ['Die Fontein - Maandblad', 'Die Fontein - Weekblad'].map((categoryName) => prisma.readingMaterial.findFirst({
      where: {
        status: 'PUBLISHED',
        isArchived: false,
        category: { name: categoryName },
      },
      include: { category: true },
      orderBy: [{ contentDate: 'desc' }, { title: 'asc' }],
    }))
  )).flatMap((item) => item ? [item] : [])

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Nuus"
        description="Gemeentenuus en aankondigings."
        image={newsHeroImage}
        icon={<Newspaper className="h-8 w-8" />}
      />

      <section className="border-b bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Nuutste publikasies</h2>
              <p className="mt-3 text-muted-foreground">Die nuutste maandblad en weekblad op een plek.</p>
            </div>
            {latestPublications.length > 0 ? <div className="mx-auto mt-8 grid max-w-5xl items-start gap-6 md:grid-cols-2">
              {latestPublications.map((item) => (
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
                  ) : null}

                  <div className="p-5">
                    <PublicationCategoryBadge category={item.category.name} />
                    <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">{item.title}</h3>
                    {item.showDate ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatDate(item.contentDate, item.category.name)}
                      </p>
                    ) : null}
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Button asChild>
                        <Link href={`/leesstof/${item.id}`}>Lees aanlyn <BookOpen className="ml-2 h-4 w-4" /></Link>
                      </Button>
                      <Button asChild variant="outline">
                        <a href={`/api/leesstof/${item.id}/download`}>Laai PDF af <Download className="ml-2 h-4 w-4" /></a>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div> : <p className="mt-8 text-center text-muted-foreground">Geen publikasies is tans beskikbaar nie.</p>}
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="w-full px-8 sm:w-auto">
                <Link href="/leesstof">
                  Sien alle publikasies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
      </section>
    </div>
  )
}
