import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Home, ArrowLeft, Search, MessageCircle } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bladsy Nie Gevind | Annlin Gemeente',
  description: 'Die bladsy wat jy soek bestaan nie. Keer terug na die tuisblad of verken ons ander bladsye.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold text-amber-200 leading-none select-none">
              404
            </h1>
          </div>
          
          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bladsy Nie Gevind
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Jammer, ons kon nie die bladsy vind wat jy soek nie. 
              Dit mag dalk geskuif of verwyder gewees het.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Terug Na Tuis
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link href="javascript:history.back()">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Vorige Bladsy
              </Link>
            </Button>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle>Tuisblad</CardTitle>
              <CardDescription>
                Begin weer by ons hoofblad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Besoek Tuisblad
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle>Diensgroepe</CardTitle>
              <CardDescription>
                Ontdek ons verskillende diensgroepe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/diensgroepe">
                  Bekyk Groepe
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle>Kontak Ons</CardTitle>
              <CardDescription>
                Laat weet ons van die probleem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/kontakbesonderhede">
                  Kontak Besonderhede
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Help Text */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            As jy dink hierdie 'n fout is, kontak ons asseblief sodat ons dit kan regstel.
          </p>
        </div>
      </div>
    </div>
  )
}
