import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Calendar, Church, Compass, Heart, MapPin, Users } from 'lucide-react'

import { PageHero } from '@/components/public/PageHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CONTACT_DETAILS } from '@/lib/constants'
import { readContentList, readContentText } from '@/lib/content-page-definitions'
import { getPublicContentPage } from '@/lib/content-pages.server'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Oor Annlin Gemeente | Gereformeerde Kerk Pretoria-Annlin',
  description: 'Leer meer oor die roeping, geloof, leierskap en geskiedenis van Gereformeerde Kerk Pretoria-Annlin.',
}

export default async function AboutPage() {
  const { sections } = await getPublicContentPage('oor-annlin-gemeente')
  const copy = (path: string) => readContentText(sections, path)
  const ministryAreas = ['spiritual', 'pastoral', 'diaconal', 'missional']
  const values = ['scripture', 'community', 'evangelism', 'service', 'grace']
  const emblemParts = ['cross', 'circle', 'halo', 'water', 'people']
  const identityCards = [
    { key: 'vision', icon: Heart },
    { key: 'faith', icon: BookOpen },
    { key: 'community', icon: Users },
  ]
  const leadershipCards = [
    { title: 'ministerName', subtitle: 'ministerRole', body: 'ministerBody' },
    { title: 'councilTitle', subtitle: null, body: 'councilBody' },
    { title: 'graceTitle', subtitle: null, body: 'graceBody' },
  ]
  const pageLinks = [
    { label: 'Wie ons is en wat ons glo', href: '#identiteit' },
    { label: 'Ons embleem', href: '#embleem' },
    { label: 'Geskiedenis', href: '#geskiedenis' },
    { label: 'Besoek ons', href: '#besoek-ons' },
  ]
  const historyImages = [
    { src: '/church-building-1974.jpg', title: 'history.oldImageTitle', body: 'history.oldImageBody' },
    { src: '/church-building-main.jpg', title: 'history.currentImageTitle', body: 'history.currentImageBody' },
  ]
  const facilities = [
    { label: 'Hoofkerk', key: 'churchBody' },
    { label: 'Kerksaal', key: 'hallBody' },
    { label: 'Katkisasielokale', key: 'classroomsBody' },
    { label: 'Parkering', key: 'parkingBody' },
  ]
  const historyFacts = readContentList(sections, 'heritage.facts')
  const historyPeriods = [
    { key: 'beginning', facts: historyFacts.slice(0, 1) },
    { key: 'building', facts: historyFacts.slice(1) },
    { key: 'modern', facts: [] },
  ]

  return (
    <div className="bg-stone-50">
      <PageHero
        title={copy('hero.title')}
        description={<><p className="font-semibold">{copy('hero.subtitle')}</p><p className="mt-3">{copy('hero.body')}</p></>}
        image="/images/home-hero-desktop.webp"
        mobileImage="/images/home-hero-mobile.webp"
        imageClassName="object-center"
        icon={<Church className="h-8 w-8" />}
      />

      <nav aria-label="Op hierdie bladsy" className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {pageLinks.map(({ label, href }) => (
            <a key={href} href={href} className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-stone-300 px-4 font-semibold text-primary hover:bg-stone-50">{label}</a>
          ))}
        </div>
      </nav>

      <section id="identiteit" className="scroll-mt-20 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-semibold uppercase tracking-[0.16em] text-primary">Wie ons is en wat ons glo</p>
            <h2 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">{copy('calling.title')}</h2>
            <p className="mt-6 text-xl leading-9 text-muted-foreground">{copy('calling.body')}</p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {identityCards.map(({ key, icon: Icon }) => (
              <Card key={key} className="border-stone-200 bg-stone-50/70">
                <CardHeader>
                  <Icon className="h-8 w-8 text-primary" />
                  <CardTitle className="pt-3 text-2xl">{copy(`calling.${key}Title`)}</CardTitle>
                </CardHeader>
                <CardContent><p className="leading-8 text-muted-foreground">{copy(`calling.${key}Body`)}</p></CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 rounded-3xl bg-primary p-6 text-primary-foreground sm:p-10">
            <div className="max-w-3xl">
              <h3 className="text-3xl font-bold">{copy('ministryAreas.title')}</h3>
              <p className="mt-3 text-primary-foreground/85">{copy('ministryAreas.body')}</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ministryAreas.map((area) => (
                <div key={area} className="rounded-2xl border border-white/20 bg-white/10 p-5">
                  <Compass className="h-6 w-6" />
                  <h4 className="mt-4 text-xl font-semibold">{copy(`ministryAreas.${area}Title`)}</h4>
                  <p className="mt-2 text-primary-foreground/85">{copy(`ministryAreas.${area}Body`)}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-white/20 pt-6 text-primary-foreground/85">{copy('ministryAreas.supportBody')}</p>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-7 sm:p-9">
              <BookOpen className="h-10 w-10 text-primary" />
              <h3 className="mt-5 text-3xl font-bold text-foreground">{copy('doctrine.title')}</h3>
              <p className="mt-5 leading-8 text-muted-foreground">{copy('doctrine.body')}</p>
              <p className="mt-5 border-l-4 border-primary pl-5 font-semibold leading-8 text-foreground">{copy('doctrine.confessions')}</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-foreground">{copy('values.title')}</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {values.map((value) => (
                  <div key={value} className="rounded-2xl border border-stone-200 bg-white p-5">
                    <h4 className="text-xl font-semibold text-foreground">{copy(`values.${value}Title`)}</h4>
                    <p className="mt-2 leading-7 text-muted-foreground">{copy(`values.${value}Body`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h3 className="text-3xl font-bold text-foreground">{copy('leadership.title')}</h3>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {leadershipCards.map(({ title, subtitle, body }) => (
                <Card key={title} className="border-stone-200">
                  <CardHeader><CardTitle className="text-2xl">{copy(`leadership.${title}`)}</CardTitle>{subtitle ? <p className="font-semibold text-primary">{copy(`leadership.${subtitle}`)}</p> : null}</CardHeader>
                  <CardContent><p className="leading-8 text-muted-foreground">{copy(`leadership.${body}`)}</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="embleem" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)] lg:px-8">
          <div className="sticky top-28 rounded-3xl bg-white p-7 shadow-sm">
            <Image src="/annlin-logo.png" alt="Annlin Gemeente se embleem" width={800} height={494} className="h-auto w-full" />
            <h2 className="mt-7 text-4xl font-bold text-foreground">{copy('emblem.title')}</h2>
            <p className="mt-4 leading-8 text-muted-foreground">{copy('emblem.body')}</p>
          </div>
          <div className="grid gap-4">
            {emblemParts.map((part, index) => (
              <article key={part} className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{index + 1}</span>
                  <div><h3 className="text-2xl font-semibold text-foreground">{copy(`emblem.${part}Title`)}</h3><p className="mt-3 leading-8 text-muted-foreground">{copy(`emblem.${part}Body`)}</p></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="geskiedenis" className="scroll-mt-20 border-y border-stone-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl">{copy('history.title')}</h2>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              {historyPeriods.map(({ key, facts }) => (
                <article key={key} className="border-l-4 border-primary pl-6">
                  <h3 className="text-2xl font-semibold text-foreground">{copy(`detailedHistory.${key}Title`)}</h3>
                  {readContentList(sections, `detailedHistory.${key}Paragraphs`).map((paragraph) => <p key={paragraph} className="mt-3 leading-8 text-muted-foreground">{paragraph}</p>)}
                  {facts.map((fact) => <p key={fact} className="mt-3 leading-8 text-muted-foreground">{fact}</p>)}
                </article>
              ))}
            </div>
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {historyImages.map(({ src, title, body }) => (
                  <figure key={src} className="overflow-hidden rounded-2xl bg-stone-900 text-white">
                    <div className="relative aspect-[4/3]"><Image src={src} alt="" fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover" /></div>
                    <figcaption className="p-4"><strong>{copy(title)}</strong><span className="mt-1 block text-stone-300">{copy(body)}</span></figcaption>
                  </figure>
                ))}
              </div>
              <p><a href="https://af.wikipedia.org/wiki/Gereformeerde_kerk_Pretoria-Annlin" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4">Lees ook die openbare geskiedenis op Wikipedia</a>.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="besoek-ons" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div><h2 className="text-4xl font-bold text-foreground">{copy('visit.title')}</h2><p className="mt-4 text-xl text-muted-foreground">{copy('visit.body')}</p><p className="mt-6 leading-8 text-muted-foreground">{copy('visit.ministryArea')}</p><Button asChild className="mt-7"><a href={CONTACT_DETAILS.mapHref} target="_blank" rel="noopener noreferrer"><MapPin className="mr-2 h-5 w-5" />Bekyk op kaart</a></Button></div>
            <Card><CardHeader><CardTitle className="text-2xl">Fasiliteite</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2">{facilities.map(({ label, key }) => <div key={key}><h3 className="font-semibold text-foreground">{label}</h3><p className="mt-1 text-muted-foreground">{copy(`visit.${key}`)}</p></div>)}<p className="border-t border-stone-200 pt-5 leading-8 text-muted-foreground sm:col-span-2">{copy('visit.accessibilityBody')}</p></CardContent></Card>
          </div>
        </div>
      </section>

      <section className="bg-primary py-14 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"><h2 className="text-4xl font-bold">{copy('cta.title')}</h2><p className="mx-auto mt-4 max-w-2xl text-xl text-primary-foreground/85">{copy('cta.body')}</p><div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"><Button asChild size="lg" className="bg-white text-primary hover:bg-stone-100"><Link href="/jaarprogram"><Calendar className="mr-2 h-5 w-5" />Besoek ’n erediens</Link></Button><Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-primary"><Link href="/kontak">Kontak ons</Link></Button></div></div>
      </section>
    </div>
  )
}
