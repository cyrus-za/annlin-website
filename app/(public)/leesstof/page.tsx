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
    where: {
      status: 'PUBLISHED',
      isArchived: false,
      category: { name: { not: 'Argief uit WordPress' } },
    },
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
      contentDate: item.contentDate.toISOString().slice(0, 10),
      showDate: item.showDate,
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
              href="https://apps.apple.com/za/app/heidelberg-catechism-rcus/id1443296306"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[4.875rem] items-center rounded-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Laai Heidelberg Catechism gratis op die App Store af"
            >
              <Image
                src="/images/store-badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                width={156}
                height={52}
                className="h-[52px] w-[156px]"
              />
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=hoogenbj.heidelbergcatechism"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[4.875rem] items-center rounded-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Laai Heidelberg Catechism gratis op Google Play af"
            >
              <Image
                src="/images/store-badges/get-it-on-google-play.png"
                alt="Get it on Google Play"
                width={200}
                height={77}
                className="h-auto w-[200px]"
              />
            </a>
          </div>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-muted-foreground">
            Apple en die Apple-logo is handelsmerke van Apple Inc. Google Play en die Google
            Play-logo is handelsmerke van Google LLC.
          </p>
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
