import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { MarkdownContent } from '@/components/content/MarkdownContent'
import { prisma } from '@/lib/db'
import { createArticleExcerpt, normalizeArticleContent } from '@/lib/public-content'

type PageProps = {
  params: Promise<{ slug: string }>
}

function formatDate(date: Date | null) {
  if (!date) return null

  return new Intl.DateTimeFormat('af-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, status: true },
  })

  if (!article || article.status !== 'PUBLISHED') {
    return {}
  }

  return {
    title: `${article.title} | Nuus | Annlin Gemeente`,
    description: article.excerpt
      ? createArticleExcerpt(article.excerpt, 160)
      : `Nuusartikel: ${article.title}`,
  }
}

export default async function NewsArticleDetailPage({ params }: PageProps) {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!article || article.status !== 'PUBLISHED') {
    notFound()
  }

  const articleExcerpt = article.excerpt ? createArticleExcerpt(article.excerpt, 180) : null
  const articleContent = normalizeArticleContent(article.content)

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="border-b bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="mb-6 -ml-4">
            <Link href="/nuus">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Terug na nuus
            </Link>
          </Button>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {article.title}
            </h1>
            {formatDate(article.publishedAt) ? (
              <div className="flex items-center gap-2 text-base text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            ) : null}
            {articleExcerpt ? (
              <p className="max-w-3xl break-words text-xl leading-8 text-muted-foreground">
                {articleExcerpt}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
            <MarkdownContent markdown={articleContent} />
          </article>
        </div>
      </section>
    </div>
  )
}
