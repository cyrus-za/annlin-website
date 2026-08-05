import { ServiceGroups } from '@/components/public/ServiceGroups'
import { getPublicServiceGroups } from '@/lib/public-service-groups.server'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { HandHeart } from 'lucide-react'
import { PageHero } from '@/components/public/PageHero'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Diensgroepe | Annlin Gemeente',
  description: 'Raak betrokke by ons verskillende diensgroepe en bedienings. Help maak \'n verskil in ons gemeente.',
}

export default async function DiensgroepePage() {
  const serviceGroups = await getPublicServiceGroups()

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title="Diensgroepe"
        description="By Annlin Gemeente het elke lidmaat ’n belangrike rol. Gebruik jou talente en maak saam ’n verskil in ons gemeente en gemeenskap."
        image="/images/diensgroepe-hero.webp"
        imageClassName="object-[center_42%]"
        icon={<HandHeart className="h-8 w-8" />}
      />

      {/* Service Groups Grid */}
      <ServiceGroups initialGroups={serviceGroups} showAll={true} />

      {/* Call to Action */}
      <section className="relative overflow-hidden bg-primary py-16">
        <Image
          src="/images/diensgroepe-cta.webp"
          alt=""
          fill
          sizes="100vw"
          quality={80}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Gereed om betrokke te raak?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-primary-foreground/90">
              Kontak ons vandag om uit te vind hoe jy by een van ons diensgroepe kan aansluit.
            </p>
            <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Link
                href="/kontak"
                className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white px-6 py-3 text-center text-base font-medium text-primary transition-colors duration-200 hover:bg-secondary sm:w-auto"
              >
                Kontak Ons
              </Link>
              <a
                href="tel:012-567-1492"
                className="inline-flex w-full items-center justify-center rounded-md border-2 border-white px-6 py-3 text-center text-base font-medium text-white transition-colors duration-200 hover:bg-white hover:text-primary sm:w-auto"
              >
                Bel Ons: 012 567 1492
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Waarom by 'n diensgroep aansluit?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Maak 'n Verskil</h3>
                    <p className="text-muted-foreground">
                      Gebruik jou talente en passies om 'n positiewe impak te maak in ons gemeente en gemeenskap.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Bou Verhoudings</h3>
                    <p className="text-muted-foreground">
                      Ontmoet nuwe mense en bou betekenisvolle vriendskappe met ander wat dieselfde waardes deel.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Groei Geestelik</h3>
                    <p className="text-muted-foreground">
                      Ontwikkel jou geloof en geestelike gawes deur diensbaarheid en samewerking met ander.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Hoe om aan te sluit
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-amber-600 pl-4">
                  <h4 className="font-semibold text-foreground">Stap 1: Kies 'n Diensgroep</h4>
                  <p className="text-muted-foreground text-sm">
                    Kyk deur ons verskillende diensgroepe en kies een wat by jou belangstellings pas.
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-4">
                  <h4 className="font-semibold text-foreground">Stap 2: Maak Kontak</h4>
                  <p className="text-muted-foreground text-sm">
                    Gebruik die kontak besonderhede om die diensgroep leier te kontak.
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-4">
                  <h4 className="font-semibold text-foreground">Stap 3: Sluit Aan</h4>
                  <p className="text-muted-foreground text-sm">
                    Kom na die volgende byeenkoms en begin jou reis van diensbaarheid!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
