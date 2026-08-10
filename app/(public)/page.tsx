import { ServiceGroups } from '@/components/public/ServiceGroups'
import { UpcomingEvents } from '@/components/public/Calendar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Newspaper, BookOpen, Mail, ArrowRight, MapPin, PlayCircle, Clock3 } from 'lucide-react'
import { Metadata } from 'next'
import { getPublicContentPage } from '@/lib/content-pages.server'
import { readContentText } from '@/lib/content-page-definitions'
import { getPublicServiceGroups } from '@/lib/public-service-groups.server'
import { getImageProps } from 'next/image'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'GK Pretoria-Annlin',
  description: 'Gereformeerde Kerk Pretoria-Annlin: saam geroep en gestuur om te dien. Vind eredienste, uitsendings, diensgroepe, gebeure en leesstof.',
}

const { props: desktopHeroProps } = getImageProps({
  src: '/images/home-hero-desktop.webp',
  alt: '',
  width: 1915,
  height: 821,
  sizes: '100vw',
  quality: 85,
  loading: 'eager',
  fetchPriority: 'high',
})

const { props: mobileHeroProps } = getImageProps({
  src: '/images/home-hero-mobile.webp',
  alt: '',
  width: 1000,
  height: 1563,
  sizes: '100vw',
  quality: 85,
  loading: 'eager',
  fetchPriority: 'high',
})

export default async function Home() {
  const [{ sections }, serviceGroups] = await Promise.all([
    getPublicContentPage('tuis'),
    getPublicServiceGroups(),
  ])
  const copy = (path: string) => readContentText(sections, path)
  const quickLinks = [
    { href: '/jaarprogram', label: 'Sien die kalender', icon: Calendar },
    { href: '/nuus', label: 'Lees die nuus', icon: Newspaper },
    { href: '/leesstof', label: 'Vind publikasies', icon: BookOpen },
    { href: '/kontak', label: 'Kontak die kerkkantoor', icon: Mail },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[36rem] overflow-hidden text-white sm:min-h-[40rem]">
        <picture className="absolute inset-0 block">
          <source
            media="(max-width: 639px)"
            sizes={mobileHeroProps.sizes}
            srcSet={mobileHeroProps.srcSet}
          />
          <img
            {...desktopHeroProps}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </picture>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(135deg, hsl(var(--hero-overlay-start) / 0.55), hsl(var(--hero-overlay-end) / 0.40))',
          }}
        />
        <div className="relative mx-auto flex min-h-[36rem] max-w-7xl items-end px-4 pb-20 pt-28 sm:min-h-[40rem] sm:px-6 sm:pb-24 lg:px-8">
          <div className="grid w-full items-end gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold text-white sm:text-6xl">
                {copy('hero.subtitle')}
              </h1>
              <p className="mb-8 mt-5 max-w-3xl text-xl leading-8 text-stone-100">
                {copy('hero.body')}
              </p>
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="bg-white text-amber-800 hover:bg-amber-50 border-0 w-full sm:w-auto">
                <Link href="/uitsendings">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Kyk na Uitsendings
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-amber-100 hover:bg-white hover:text-amber-800 bg-transparent w-full sm:w-auto">
                <Link href="/oor-annlin-gemeente">
                  Leer Meer Oor Ons
                </Link>
              </Button>
              </div>
            </div>

            <aside className="rounded-2xl border border-white/25 bg-stone-950/45 p-6 shadow-xl backdrop-blur-md" aria-label="Besoekinligting">
              <h2 className="text-2xl font-semibold text-white">Besoek ons</h2>
              <div className="mt-5 space-y-4 text-stone-100">
                <p className="flex items-start gap-3"><Clock3 className="mt-1 h-5 w-5 shrink-0" /><span>Sondae om 08:30 en 18:30</span></p>
                <p className="flex items-start gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0" /><span>H/v Braam Pretoriusstraat en Kaneelbaslaan, Wonderboom</span></p>
              </div>
              <Button asChild className="mt-6 w-full bg-white text-primary hover:bg-stone-100">
                <Link href="/kontak">Kontak en aanwysings</Link>
              </Button>
            </aside>
          </div>
        </div>
      </section>

      <nav aria-label="Vind vinnig" className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg lg:grid-cols-4">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex min-h-24 items-center gap-3 border-stone-200 p-4 font-semibold text-foreground transition-colors hover:bg-stone-50 odd:border-r lg:border-r lg:last:border-r-0">
              <Icon className="h-6 w-6 shrink-0 text-primary" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <section className="bg-stone-50 pb-14 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <p className="mb-3 font-semibold uppercase tracking-[0.16em] text-primary">Wie ons is en wat ons glo</p>
            <h2 className="mb-5 text-4xl font-bold text-foreground sm:text-5xl">
                {copy('about.title')}
              </h2>
              <p className="mb-7 max-w-4xl text-xl leading-8 text-muted-foreground">
                {copy('about.body')}
              </p>
              <div className="mt-8">
                <Button asChild>
                  <Link href="/oor-annlin-gemeente">
                    Lees wie ons is en wat ons glo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      <UpcomingEvents limit={4} heading={copy('events.title')} description={copy('events.body')} emptyMessage={copy('events.empty')} />

      <ServiceGroups initialGroups={serviceGroups} heading={copy('serviceGroups.title')} description={copy('serviceGroups.body')} />
    </div>
  )
}
