import { ServiceGroups } from '@/components/public/ServiceGroups'
import { UpcomingEvents } from '@/components/public/Calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Calendar, Newspaper, BookOpen, Mail, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'
import { APP_CONFIG } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Annlin Gemeente | Welkom',
  description: 'Welkom by die amptelike webwerf van Annlin Gemeente. Vind uit meer oor ons eredienste, diensgroepe, gebeure en hoe om betrokke te raak.',
}

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat py-16 text-white sm:py-20"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(146, 64, 14, 0.85), rgba(120, 53, 15, 0.85)), url('/church-building-main.jpg')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welkom by Annlin Gemeente
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 mb-4 max-w-3xl mx-auto">
              Gereformeerde Kerk Pretoria-Annlin
            </p>
            <p className="text-lg text-amber-200 mb-8 max-w-4xl mx-auto">
              Geroep tot 'n lewende geloof in God-Drie-Enig waar almal hul gawes tot Sy eer gebruik. 
              H/v Braam Pretoriusstraat en Kaneelbaslaan, Wonderboom, Pretoria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-white text-amber-800 hover:bg-amber-50 border-0 w-full sm:w-auto">
                <Link href="/uitsendings">
                  <Calendar className="mr-2 h-5 w-5" />
                  Bekyk Eredienste
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-amber-100 hover:bg-white hover:text-amber-800 bg-transparent w-full sm:w-auto">
                <Link href="/oor-annlin-gemeente">
                  Leer Meer Oor Ons
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <UpcomingEvents limit={3} />

      {/* Service Groups Section */}
      <ServiceGroups limit={16} />

      {/* Quick Links Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground">Verken Ons Webwerf</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Vind alles wat jy nodig het om betrokke te raak by ons gemeente
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="group border-stone-200 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <CardHeader className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 transition-colors group-hover:bg-amber-200">
                  <Calendar className="h-6 w-6 text-amber-700" />
                </div>
                <CardTitle>Jaarprogram</CardTitle>
                <CardDescription>
                  Eredienste, gebeure en belangrike datums
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/jaarprogram">
                    Bekyk Kalender
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group border-stone-200 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <CardHeader className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 transition-colors group-hover:bg-orange-200">
                  <Newspaper className="h-6 w-6 text-orange-700" />
                </div>
                <CardTitle>Nuus & Aankondigings</CardTitle>
                <CardDescription>
                  Bly op hoogte met gemeente nuus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/nuus">
                    Lees Nuus
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group border-stone-200 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <CardHeader className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-100 transition-colors group-hover:bg-yellow-200">
                  <BookOpen className="h-6 w-6 text-yellow-700" />
                </div>
                <CardTitle>Leesstof</CardTitle>
                <CardDescription>
                  Preke, studies en geestelike materiaal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/leesstof">
                    Bekyk Materiaal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group border-stone-200 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <CardHeader className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-stone-100 transition-colors group-hover:bg-stone-200">
                  <Mail className="h-6 w-6 text-stone-700" />
                </div>
                <CardTitle>Kontak Ons</CardTitle>
                <CardDescription>
                  Kom in aanraking met ons gemeente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/kontakbesonderhede">
                    Kontak Besonderhede
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-stone-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div>
              <h2 className="mb-5 text-3xl font-bold text-amber-900">
                Oor Annlin Gemeente
              </h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Ons is 'n lewendige gemeente wat toegewy is aan die verkondiging van God se Woord 
                en die bou van 'n gemeenskap waar almal welkom is. Ons glo in die krag van geloof, 
                hoop en liefde om lewens te transformeer.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-amber-600 rounded-full mr-3"></div>
                  <span className="text-foreground/80">Eredienste elke Sondag om 08:30 en 18:30</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-amber-600 rounded-full mr-3"></div>
                  <span className="text-foreground/80">Aktiewe jeug- en kinderprogramme</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-amber-600 rounded-full mr-3"></div>
                  <span className="text-foreground/80">Gemeenskapsbetrokkenheid en uitreikprogramme</span>
                </div>
              </div>
              <div className="mt-8">
                <Button asChild>
                  <Link href="/oor-annlin-gemeente">
                    Leer Meer Oor Ons
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="grid gap-5">
              <Card className="overflow-hidden border-stone-200 shadow-sm">
                <div className="h-48 bg-cover bg-center" style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('/church-building-1974.jpg')`
                }}>
                  <div className="h-full flex items-end p-6">
                    <div className="text-white">
                      <h3 className="text-xl font-bold mb-2">Ons Geskiedenis</h3>
                      <p className="text-sm text-gray-200">Gestig in 1965</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6">
                    Lees meer oor die ontstaan van Gereformeerde Kerk Pretoria-Annlin en die
                    ingebruikneming van ons kerkgebou.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/oor-annlin-gemeente#geskiedenis">
                      Lees Ons Geskiedenis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-stone-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Besoek Ons</CardTitle>
                  <CardDescription>
                    Eredienstye, ligging en kontakbesonderhede
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Eredienste</h4>
                    <p className="text-muted-foreground">Sondae om 08:30 en 18:30</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Adres</h4>
                    <p className="text-muted-foreground">
                      H/v Braam Pretoriusstraat en Kaneelbaslaan<br />
                      Wonderboom, Pretoria<br />
                      0182
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Kontak</h4>
                    <p className="text-muted-foreground">
                      Tel: 012 567 1492<br />
                      Sel: 079 162 3453<br />
                      E-pos: {APP_CONFIG.email}
                    </p>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/kontakbesonderhede">
                      Volledige Kontak Besonderhede
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
