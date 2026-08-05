import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ExternalLink, FileText, LibraryBig } from 'lucide-react'
import { prisma } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ResourceLibrary } from '@/components/public/ResourceLibrary'

export const metadata: Metadata = {
  title: 'Leesstof en publikasies | Annlin Gemeente',
  description: 'Publikasies, leesstof, preeksamevattings en geloofsmateriaal van Annlin Gemeente.',
}

export const revalidate = 300

const readingHeroImage =
  'https://pub-01a6d5f65bcd4bc1aa7f7f9669e4b9e8.r2.dev/wordpress-media/1854-Leesstof.jpg'

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
    where: { status: 'PUBLISHED' },
    include: { category: true },
    orderBy: [{ contentDate: 'desc' }, { title: 'asc' }],
  })

  const libraryItems = materials
    .filter((item) => item.title !== 'Leesstof')
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      fileType: item.fileType,
      fileSize: item.fileSize,
      contentDate: item.contentDate.toISOString().slice(0, 10),
      showDate: item.showDate,
      isArchived: item.isArchived || item.category.name === 'Argief uit WordPress',
      category: item.category.name,
    }))

  return (
    <div className="min-h-screen bg-stone-50">
      <section
        className="relative flex min-h-[24rem] items-end overflow-hidden bg-stone-900 sm:min-h-[30rem]"
      >
        <Image
          src={readingHeroImage}
          alt=""
          fill
          preload
          sizes="100vw"
          quality={80}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-stone-950/10" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 sm:pb-16 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-white/20 bg-white/15 backdrop-blur-sm">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold sm:text-5xl">Leesstof en publikasies</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100 sm:text-xl">
              Publikasies, leesstof en toerustingsmateriaal vir die gemeente.
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
              <Link href="/kontak" className="font-medium text-amber-800 underline underline-offset-4">
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

      <Suspense fallback={<div className="min-h-80 bg-white" />}>
        <ResourceLibrary items={libraryItems} />
      </Suspense>

      <section className="py-14">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground">Gratis! Gratis! Gratis!</h2>
          <div className="mt-6 space-y-4 text-lg leading-8 text-muted-foreground">
            <p>
              Die Heidelbergse Kategismus in Engels in oudio formaat. Elke vraag en antwoord word
              opgevolg met &apos;n toepaslike bybelteks.
            </p>
            <p>
              Ideaal vir blinde of swaksiende persone, ongeletterdes of as jy jou Christelike leer
              wil opskerp wanneer jy reis.
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="https://play.google.com/store/apps/details?id=hoogenbj.heidelbergcatechism"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-16 w-60 items-center gap-4 rounded-xl bg-stone-950 px-5 py-3 text-left text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Laai Heidelberg Catechism gratis op Google Play af"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 shrink-0 fill-current">
                <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
              </svg>
              <span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-stone-300">
                  Laai gratis af op
                </span>
                <span className="block text-xl font-semibold leading-tight">Google Play</span>
              </span>
            </a>

            <a
              href="https://apps.apple.com/za/app/heidelberg-catechism-rcus/id1443296306"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-16 w-60 items-center gap-4 rounded-xl bg-stone-950 px-5 py-3 text-left text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Laai Heidelberg Catechism gratis op die App Store af"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 shrink-0 fill-current">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              <span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-stone-300">
                  Laai gratis af op
                </span>
                <span className="block text-xl font-semibold leading-tight">App Store</span>
              </span>
            </a>
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

    </div>
  )
}
