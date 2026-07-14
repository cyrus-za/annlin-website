import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, FileText, Link as LinkIcon } from 'lucide-react'

import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { extractMarkdownAudioLinks, stripMarkdownAudioLinks } from '@/lib/public-content'
import { markdownToHtml } from '@/lib/tiptap-config'

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

  const audioLinks = material.description ? extractMarkdownAudioLinks(material.description) : []
  const description = material.description
    ? stripMarkdownAudioLinks(material.description)
    : null
  const descriptionHtml = description ? markdownToHtml(description) : null
  const hasInlineLinks = Boolean(description?.match(/\[[^\]]+\]\([^)]+\)/))

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
          <article className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            {descriptionHtml ? (
              <div
                className="prose prose-lg max-w-none break-words [&_a]:font-semibold [&_a]:text-amber-800 [&_a]:underline [&_a]:decoration-amber-700/50 [&_a]:underline-offset-4 [&_a:hover]:text-amber-950 [&_img]:mx-auto [&_img]:h-auto [&_img]:max-h-[34rem] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : (
              <p className="text-muted-foreground">
                Geen verdere beskrywing is tans vir hierdie leesstof-item beskikbaar nie.
              </p>
            )}

            {audioLinks.length > 0 ? (
              <section className="mt-8 border-t border-stone-200 pt-8" aria-labelledby="audio-heading">
                <h2 id="audio-heading" className="text-2xl font-semibold text-foreground">
                  Luister na die oordenkings
                </h2>
                <div className="mt-5 space-y-5">
                  {audioLinks.map((audio) => (
                    <article key={audio.url} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                      <h3 className="font-semibold text-foreground">{audio.title}</h3>
                      <audio
                        controls
                        preload="none"
                        className="mt-3 w-full"
                        aria-label={audio.title}
                      >
                        <source src={audio.url} type="audio/mpeg" />
                        <a href={audio.url} target="_blank" rel="noopener noreferrer">
                          Maak die klankopname oop
                        </a>
                      </audio>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="self-start space-y-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-foreground">Bronne en hulp</h2>

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

            {!material.externalUrl && !material.fileUrl && (hasInlineLinks || audioLinks.length > 0) ? (
              <div className="rounded-md bg-stone-50 p-4 text-sm text-muted-foreground">
                {audioLinks.length > 0
                  ? 'Die klankopnames kan direk op hierdie blad afgespeel word.'
                  : 'Die aflaai- en bronskakels is in die inhoud gemerk.'}
              </div>
            ) : null}

            {!material.externalUrl && !material.fileUrl && !hasInlineLinks && audioLinks.length === 0 ? (
              <div className="rounded-md bg-stone-50 p-4 text-sm text-muted-foreground">
                Geen aparte skakel of lêer is vir hierdie item beskikbaar nie. Kontak die kerkkantoor
                indien jy die bronmateriaal benodig.
              </div>
            ) : null}

            <div className="rounded-md bg-stone-50 p-4 text-sm text-muted-foreground">
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
