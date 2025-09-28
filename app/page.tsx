import { ServiceGroups } from '@/components/public/ServiceGroups'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Calendar, Newspaper, BookOpen, Mail, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Annlin Gemeente | Welkom',
  description: 'Welkom by die amptelike webwerf van Annlin Gemeente. Vind uit meer oor ons eredienste, diensgroepe, gebeure en hoe om betrokke te raak.',
  keywords: ['Annlin Gemeente', 'kerk', 'eredienste', 'diensgroepe', 'geloof', 'gemeenskap'],
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welkom by Annlin Gemeente
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              'n Plek waar geloof, gemeenskap en liefde saamkom. 
              Sluit by ons aan vir betekenisvolle aanbidding en geestelike groei.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/jaarprogram">
                  <Calendar className="mr-2 h-5 w-5" />
                  Bekyk Eredienste
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/oor-annlin-gemeente">
                  Leer Meer Oor Ons
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Groups Section */}
      <ServiceGroups limit={6} />

      {/* Quick Links Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Verken Ons Webwerf</h2>
            <p className="mt-4 text-lg text-gray-600">
              Vind alles wat jy nodig het om betrokke te raak by ons gemeente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Calendar className="h-6 w-6 text-green-600" />
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

            <Card className="hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Newspaper className="h-6 w-6 text-purple-600" />
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

            <Card className="hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <BookOpen className="h-6 w-6 text-orange-600" />
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

            <Card className="hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Mail className="h-6 w-6 text-blue-600" />
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Oor Annlin Gemeente
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Ons is 'n lewendige gemeente wat toegewy is aan die verkondiging van God se Woord 
                en die bou van 'n gemeenskap waar almal welkom is. Ons glo in die krag van geloof, 
                hoop en liefde om lewens te transformeer.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Eredienste elke Sondag om 09:00 en 18:00</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Aktiewe jeug- en kinderprogramme</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Gemeenskapsbetrokkenheid en uitreikprogramme</span>
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
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Besoek Ons
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Eredienste</h4>
                  <p className="text-gray-600">Sondae om 09:00 en 18:00</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Adres</h4>
                  <p className="text-gray-600">
                    Annlin Gemeente<br />
                    [Adres sal hier wees]<br />
                    Pretoria, Gauteng
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Kontak</h4>
                  <p className="text-gray-600">
                    Tel: 012 345 6789<br />
                    E-pos: info@annlin-gemeente.co.za
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href="/kontakbesonderhede">
                    Volledige Kontak Besonderhede
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
