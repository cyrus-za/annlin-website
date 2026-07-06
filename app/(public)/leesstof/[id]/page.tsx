import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, FileText, Link as LinkIcon } from 'lucide-react'

import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ReadingMaterialDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function getReadingMaterial(id: string) {
  return prisma.readingMaterial.findUnique({
    where: { id },
    include: { category: true },
  })
}

export async function generateMetadata({ params }: ReadingMaterialDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const material = await getReadingMaterial(id)

  if (!material) {
    return {
      title: 'Leesstof nie gevind nie | Annlin Gemeente',
    }
  }

  return {
    title: `${material.title} | Leesstof | Annlin Gemeente`,
    description: material.description?.slice(0, 160) || 'Leesstof en toerusting van Annlin Gemeente.',
  }
}

export default async function ReadingMaterialDetailPage({ params }: ReadingMaterialDetailPageProps) {
  const { id } = await params
  const material = await getReadingMaterial(id)

  if (!material) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="border-b bg-white py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="mb-6 -ml-3 text-amber-900 hover:text-amber-950">
            <Link href="/leesstof">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug na leesstof
            </Link>
          </Button>

          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full">
              {material.category.name}
            </Badge>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">{material.title}</h1>
            <p className="max-w-3xl text-lg text-muted-foreground">
              Verdere inligting, skakels en beskrywing vir hierdie leesstof-item.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-4xl gap-8 px-4 sm:px-6 lg:px-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            {material.description ? (
              <div className="space-y-5 text-base leading-8 text-foreground">
                {material.description
                  .split(/\n{2,}/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={`${material.id}-paragraph-${index}`} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Geen verdere beskrywing is tans vir hierdie leesstof-item beskikbaar nie.
              </p>
            )}
          </article>

          <aside className="space-y-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Beskikbare skakels</h2>

            {material.externalUrl ? (
              <Button asChild className="w-full justify-between">
                <a href={material.externalUrl} target="_blank" rel="noopener noreferrer">
                  Eksterne skakel
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : null}

            {material.fileUrl ? (
              <Button asChild variant="outline" className="w-full justify-between">
                <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                  Lêer oopmaak
                  <FileText className="h-4 w-4" />
                </a>
              </Button>
            ) : null}

            {!material.externalUrl && !material.fileUrl ? (
              <div className="rounded-2xl bg-stone-50 p-4 text-sm text-muted-foreground">
                Geen aparte skakel of lêer is vir hierdie item opgelaai nie. Gebruik die beskrywing links
                of kontak die kerkkantoor indien jy die bronmateriaal benodig.
              </div>
            ) : null}

            <div className="rounded-2xl bg-stone-50 p-4 text-sm text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <LinkIcon className="h-4 w-4 text-amber-700" />
                Meer hulp
              </div>
              <p>
                Indien hierdie leesstof nie genoeg konteks gee nie, gebruik die kontakblad vir verdere navrae.
              </p>
            </div>

            <Button asChild variant="ghost" className="w-full text-amber-900 hover:text-amber-950">
              <Link href="/kontakbesonderhede">Kontak kerkkantoor</Link>
            </Button>
          </aside>
        </div>
      </section>
    </div>
  )
}
