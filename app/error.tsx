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
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Oeps. Iets het verkeerd geloop.
            </h1>
          </div>

          <div className="mb-8">
            <p className="mx-auto mb-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Ons het 'n onverwagte probleem ondervind terwyl die bladsy gelaai het. Probeer asseblief weer, of gaan terug na die tuisblad.
            </p>
            <p className="text-sm text-muted-foreground">
              As dit aanhou gebeur, laat weet die kerkkantoor sodat ons dit kan ondersoek.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button onClick={reset} size="lg" className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="mr-2 h-5 w-5" />
              Probeer weer
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Terug na tuis
              </Link>
            </Button>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-8 border-red-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600">Ontwikkelings Inligting</CardTitle>
              <CardDescription>Hierdie inligting is slegs sigbaar tydens ontwikkeling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-red-50 p-4">
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100">
                <Home className="h-6 w-6 text-amber-700" />
              </div>
              <CardTitle>Tuisblad</CardTitle>
              <CardDescription>Begin weer by ons hoofblad</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Besoek tuisblad</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100">
                <RefreshCw className="h-6 w-6 text-amber-700" />
              </div>
              <CardTitle>Diensgroepe</CardTitle>
              <CardDescription>Ontdek ons verskillende diensgroepe</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/diensgroepe">Bekyk groepe</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100">
                <MessageCircle className="h-6 w-6 text-amber-700" />
              </div>
              <CardTitle>Rapporteer Probleem</CardTitle>
              <CardDescription>Laat ons weet van die fout</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/kontakbesonderhede">Kontak ons</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            As hierdie probleem voortduur, kontak ons asseblief sodat ons dit kan ondersoek.
          </p>
        </div>
      </div>
    </div>
  )
}
