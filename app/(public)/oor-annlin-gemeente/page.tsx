import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb } from '@/components/public/Navigation'
import Link from 'next/link'
import { Calendar, Users, Heart, BookOpen, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'
import { getPublicContentPage } from '@/lib/content-pages.server'
import { readContentList, readContentText } from '@/lib/content-page-definitions'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Oor Annlin Gemeente | Gereformeerde Kerk Pretoria-Annlin',
  description: 'Leer meer oor die geskiedenis, visie en missie van Gereformeerde Kerk Pretoria-Annlin. Gestig in 1965 en toegewy aan die verkondiging van God se Woord.',
}

export default async function AboutPage() {
  const { sections } = await getPublicContentPage('oor-annlin-gemeente')
  const copy = (path: string) => readContentText(sections, path)

  return (
    <div>
      <Breadcrumb items={[{ name: 'Oor Annlin-Gemeente' }]} />
      
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(146, 64, 14, 0.85), rgba(120, 53, 15, 0.85)), url('/church-building-main.jpg')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {copy('hero.title')}
            </h1>
            <p className="text-xl text-amber-100 mb-4 max-w-3xl mx-auto">
              {copy('hero.subtitle')}
            </p>
            <p className="text-lg text-amber-200 max-w-4xl mx-auto">
              {copy('hero.body')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amber-900 mb-4">{copy('calling.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              {copy('calling.body')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-amber-700" />
                </div>
                <CardTitle className="text-amber-900">{copy('calling.visionTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {copy('calling.visionBody')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-amber-700" />
                </div>
                <CardTitle className="text-amber-900">{copy('calling.faithTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {copy('calling.faithBody')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-amber-700" />
                </div>
                <CardTitle className="text-amber-900">{copy('calling.communityTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {copy('calling.communityBody')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id="geskiedenis" className="py-16 bg-amber-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-amber-900 mb-6">{copy('history.title')}</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-amber-600 pl-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{copy('history.foundingTitle')}</h3>
                  <p className="text-muted-foreground">
                    {copy('history.foundingBody')}
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{copy('history.buildingTitle')}</h3>
                  <p className="text-muted-foreground">
                    {copy('history.buildingBody')}
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{copy('history.todayTitle')}</h3>
                  <p className="text-muted-foreground">
                    {copy('history.todayBody')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div 
                className="h-64 bg-cover bg-center rounded-lg shadow-lg"
                style={{
                  backgroundImage: `url('/church-building-1974.jpg')`
                }}
              >
                <div className="h-full bg-gradient-to-t from-black/50 to-transparent rounded-lg flex items-end p-6">
                  <div className="text-white">
                    <h4 className="font-bold text-lg">{copy('history.oldImageTitle')}</h4>
                    <p className="text-sm text-gray-200">{copy('history.oldImageBody')}</p>
                  </div>
                </div>
              </div>

              <div 
                className="h-64 bg-cover bg-center rounded-lg shadow-lg"
                style={{
                  backgroundImage: `url('/church-building-main.jpg')`
                }}
              >
                <div className="h-full bg-gradient-to-t from-black/50 to-transparent rounded-lg flex items-end p-6">
                  <div className="text-white">
                    <h4 className="font-bold text-lg">{copy('history.currentImageTitle')}</h4>
                    <p className="text-sm text-gray-200">{copy('history.currentImageBody')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership and Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Leadership */}
            <div>
              <h2 className="text-3xl font-bold text-amber-900 mb-8">{copy('leadership.title')}</h2>
              
              <div className="space-y-6">
                <div className="bg-amber-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">{copy('leadership.ministerName')}</h3>
                  <p className="text-amber-700 font-medium mb-3">{copy('leadership.ministerRole')}</p>
                  <p className="text-muted-foreground">
                    {copy('leadership.ministerBody')}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">{copy('leadership.councilTitle')}</h3>
                  <p className="text-muted-foreground">
                    {copy('leadership.councilBody')}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">{copy('leadership.graceTitle')}</h3>
                  <p className="text-muted-foreground">
                    {copy('leadership.graceBody')}
                  </p>
                </div>
              </div>
            </div>

            {/* Our Beliefs and Values */}
            <div>
              <h2 className="text-3xl font-bold text-amber-900 mb-8">{copy('values.title')}</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{copy('values.scriptureTitle')}</h4>
                    <p className="text-muted-foreground">{copy('values.scriptureBody')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{copy('values.communityTitle')}</h4>
                    <p className="text-muted-foreground">{copy('values.communityBody')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{copy('values.evangelismTitle')}</h4>
                    <p className="text-muted-foreground">{copy('values.evangelismBody')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{copy('values.serviceTitle')}</h4>
                    <p className="text-muted-foreground">{copy('values.serviceBody')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{copy('values.graceTitle')}</h4>
                    <p className="text-muted-foreground">{copy('values.graceBody')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button asChild variant="outline">
                  <Link href="/diensgroepe">
                    <Users className="mr-2 h-4 w-4" />
                    Raak Betrokke
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed History */}
      <section className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-12 text-center">{copy('detailedHistory.title')}</h2>
          
          <div className="space-y-12">
            {/* 1960s */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-amber-800 mb-4">{copy('detailedHistory.beginningTitle')}</h3>
                {readContentList(sections, 'detailedHistory.beginningParagraphs').map((paragraph, index, items) => (
                  <p key={paragraph} className={`text-muted-foreground ${index < items.length - 1 ? 'mb-4' : ''}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-amber-900 mb-3">Belangrike Datums</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stigtingsdatum:</span>
                    <span className="font-medium">16 Oktober 1965</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eerste Predikant:</span>
                    <span className="font-medium">Ds. J.H. Boneschans</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Afgestig van:</span>
                    <span className="font-medium">Eloffsdal-Wonderboom-Suid</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1970s */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div 
                className="h-64 bg-cover bg-center rounded-lg shadow-lg order-2 lg:order-1"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/church-building-1974.jpg')`
                }}
              >
                <div className="h-full flex items-end p-6">
                  <div className="text-white">
                    <h4 className="font-bold text-lg">Kerkgebou 1974</h4>
                    <p className="text-sm text-gray-200">Ontwerp deur argitek Johan de Ridder</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-2xl font-bold text-amber-800 mb-4">{copy('detailedHistory.buildingTitle')}</h3>
                {readContentList(sections, 'detailedHistory.buildingParagraphs').map((paragraph, index, items) => (
                  <p key={paragraph} className={`text-muted-foreground ${index < items.length - 1 ? 'mb-4' : ''}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Modern Era */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-amber-800 mb-4">{copy('detailedHistory.modernTitle')}</h3>
                {readContentList(sections, 'detailedHistory.modernParagraphs').map((paragraph, index, items) => (
                  <p key={paragraph} className={`text-muted-foreground ${index < items.length - 1 ? 'mb-4' : ''}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <div 
                className="h-64 bg-cover bg-center rounded-lg shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/church-building-main.jpg')`
                }}
              >
                <div className="h-full flex items-end p-6">
                  <div className="text-white">
                    <h4 className="font-bold text-lg">Kerkgebou Vandag</h4>
                    <p className="text-sm text-gray-200">Die vergrote kerkgebou, 2019</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location and Contact */}
      <section id="besoek-ons" className="py-16 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amber-900">{copy('visit.title')}</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {copy('visit.body')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Ligging</CardTitle>
                <CardDescription>
                  Ons kerkgebou en omgewing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Adres</h4>
                  <p className="text-muted-foreground">
                    H/v Braam Pretoriusstraat en Kaneelbaslaan<br />
                    Wonderboom, Pretoria<br />
                    0182
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Bedieningsgebied</h4>
                  <p className="text-muted-foreground text-sm">
                    {copy('visit.ministryArea')}
                  </p>
                </div>

                <div className="pt-4">
                  <Button asChild className="w-full">
                    <a 
                      href="https://maps.google.com/search/Braam+Pretoriusstraat+Kaneelbaslaan+Wonderboom+Pretoria" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Bekyk op Kaart
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Fasiliteite</CardTitle>
                <CardDescription>
                  Wat ons aanbied
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Hoofkerk</h4>
                    <p className="text-muted-foreground">{copy('visit.churchBody')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Kerksaal</h4>
                    <p className="text-muted-foreground">{copy('visit.hallBody')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Katkisasielokale</h4>
                    <p className="text-muted-foreground">{copy('visit.classroomsBody')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Parkering</h4>
                    <p className="text-muted-foreground">{copy('visit.parkingBody')}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-foreground mb-2">Toeganklikheid</h4>
                  <p className="text-muted-foreground text-sm">
                    {copy('visit.accessibilityBody')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-amber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {copy('cta.title')}
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              {copy('cta.body')}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-amber-800 hover:bg-amber-50">
                <Link href="/jaarprogram">
                  <Calendar className="mr-2 h-5 w-5" />
                  Besoek 'n Erediens
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white bg-transparent text-white hover:bg-white hover:text-amber-800">
                <Link href="/kontak">
                  Kontak Ons
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
