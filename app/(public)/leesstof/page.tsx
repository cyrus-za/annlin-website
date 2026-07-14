import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ExternalLink, FileText, LibraryBig } from 'lucide-react'
import { prisma } from '@/lib/db'
import { createExcerpt } from '@/lib/public-content'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leesstof | Annlin Gemeente',
  description: 'Leesstof, preeksamevattings en geloofsmateriaal van Annlin Gemeente.',
}

export const revalidate = 300

const booksForSale = [
  {
    title: 'Openbaring',
    subtitle: "'n Reeks van dertig preke",
    authorPrice: 'Dr. H.M. Zwemstra - R80.00',
    image: '/migrated/leesstof/openbaring.jpeg',
    imageAlt: 'Openbaring boekomslag',
  },
  {
    title: 'Die pad na die skat vir die hart',
    subtitle: "'n reeks preke oor Filippense 4:1-9",
    authorPrice: 'Ds. G.J.J van der Merwe - R40.00',
    image: '/migrated/leesstof/die-pad-na-die-skat.jpeg',
    imageAlt: 'Die pad na die skat vir die hart boekomslag',
  },
  {
    title: 'Op Jesus se laaste sewe dae voetspoor',
    authorPrice: 'Dr. Jan Venter - R200.00',
    image: '/migrated/leesstof/op-jesus-se-laaste-sewe-dae.jpeg',
    imageAlt: 'Op Jesus se laaste sewe dae voetspoor boekomslag',
  },
  {
    title: 'Die boek Prediker',
    authorPrice: 'Dr. Jan Venter - R200.00',
    image: '/migrated/leesstof/die-boek-prediker.jpeg',
    imageAlt: 'Die boek Prediker boekomslag',
  },
]

const resourceLinks = [
  {
    title: 'Opleidingsmateriaal wat al vir ons uitreike gebruik is',
    label: 'Opleidingsmateriaal',
    href: '/migrated/leesstof/opleidingsmateriaal-vir-uitreike.pdf',
  },
  {
    title: 'Verslae oor Uitreike na Mosambiek',
    label: 'Uitreike',
    href: '/migrated/leesstof/verslae-oor-uitreike-na-die-buiteland.pdf',
  },
]

export default async function ReadingPage() {
  const materials = await prisma.readingMaterial.findMany({
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  })

  const additionalMaterials = materials.filter(
    (item) => item.title !== 'Leesstof' && item.category.name !== 'Argief uit WordPress'
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="border-b bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <BookOpen className="h-6 w-6 text-amber-800" />
            </div>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Leesstof</h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Boeke, preeksamevattings en toerustingsmateriaal vir die gemeente.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Boeke te koop
            </h2>
            <p className="mt-3 text-muted-foreground">
              Beskikbaar by die{' '}
              <Link href="/kontakbesonderhede" className="font-medium text-amber-800 underline underline-offset-4">
                Kerkkantoor
              </Link>
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {booksForSale.map((book) => (
              <article key={book.title} className="flex h-full flex-col">
                <div className="mb-5 min-h-24">
                  <h3 className="text-2xl font-semibold leading-tight text-foreground">{book.title}</h3>
                  {book.subtitle && (
                    <p className="mt-3 font-medium text-foreground">{book.subtitle}</p>
                  )}
                </div>
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-stone-100 shadow-sm">
                  <Image
                    src={book.image}
                    alt={book.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-5 text-center italic text-foreground">{book.authorPrice}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground">Gratis! Gratis! Gratis!</h2>
          <div className="mt-6 space-y-4 text-lg leading-8 text-muted-foreground">
            <p>
              Die Heidelbergse Kategismus in Engels in oudio formaat. Elke vraag en antwoord word
              opgevolg met 'n toepaslike bybelteks.
            </p>
            <p>
              Kan gerieflik op 'n selfoon afgelaai word. Vir Android selfone, soek vir
              "Heidelberg Catechism" en vir Apple selfone soek dieselfde op App Store.
            </p>
            <p>
              Ideaal vir blinde of swaksiende persone, ongeletterdes of as jy jou Christelike leer
              wil opskerp wanneer jy reis.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          {resourceLinks.map((resource) => (
            <Card key={resource.href}>
              <CardHeader>
                <CardTitle className="flex items-start gap-3 text-2xl">
                  <FileText className="mt-1 h-6 w-6 shrink-0 text-amber-800" />
                  <span>{resource.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <a href={resource.href}>
                    Klik op {resource.label}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <LibraryBig className="mx-auto h-14 w-14 text-red-700" />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            GKSA Deputate vir Gereformeerde Publikasies
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Bekom nuttige leesstof vanaf die webtuiste van die Calvyn Jubileum Boekefonds.
          </p>
          <Button asChild className="mt-6">
            <a href="https://www.cjbf.co.za/" target="_blank" rel="noopener noreferrer">
              Besoek CJBF
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {additionalMaterials.length > 0 ? (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground">Meer Leesstof</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {additionalMaterials.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-amber-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {item.description && (
                      <p className="line-clamp-5 text-muted-foreground">
                        {createExcerpt(item.description, 260)}
                      </p>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button asChild>
                        <Link href={`/leesstof/${item.id}`}>
                          Lees meer
                        </Link>
                      </Button>
                      {(item.externalUrl || item.fileUrl) && (
                        <Button asChild variant="outline">
                          <a href={item.externalUrl || item.fileUrl || '#'} target="_blank" rel="noopener noreferrer">
                            Maak bron oop
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
