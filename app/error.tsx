'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Home, RefreshCw, AlertTriangle, MessageCircle } from 'lucide-react'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Oeps! Iets Het Verkeerd Geloop
            </h1>
          </div>
          
          {/* Error Message */}
          <div className="mb-8">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Ons het 'n onverwagte fout ondervind. Moenie bekommerd wees nie - 
              ons span werk hard om sulke probleme op te los.
            </p>
            <p className="text-sm text-gray-500">
              Probeer asseblief weer, of keer terug na die tuisblad.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={reset}
              size="lg" 
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Probeer Weer
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Terug Na Tuis
              </Link>
            </Button>
          </div>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-8 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Ontwikkelings Inligting</CardTitle>
              <CardDescription>
                Hierdie inligting is slegs sigbaar tydens ontwikkeling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm font-mono text-red-800 break-all">
                  <strong>Fout:</strong> {error.message}
                </p>
                {error.digest && (
                  <p className="text-sm font-mono text-red-700 mt-2">
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                <RefreshCw className="h-6 w-6 text-amber-600" />
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
              <CardTitle>Rapporteer Probleem</CardTitle>
              <CardDescription>
                Laat ons weet van die fout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/kontakbesonderhede">
                  Kontak Ons
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Help Text */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            As hierdie probleem voortduur, kontak ons asseblief sodat ons dit kan ondersoek.
          </p>
        </div>
      </div>
    </div>
  )
}
