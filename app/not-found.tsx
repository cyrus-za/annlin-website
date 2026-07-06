import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Home, Search, MessageCircle } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bladsy Nie Gevind | Annlin Gemeente',
  description: 'Die bladsy wat jy soek bestaan nie. Keer terug na die tuisblad of verken ons ander bladsye.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
            <Search className="h-7 w-7 text-amber-800" />
          </div>
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
              Ons kon nie daardie bladsy kry nie
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
              Die skakel is moontlik oud, of die inhoud is na 'n ander plek geskuif. Gebruik die
              knoppies hieronder om terug te kom by iets bruikbaars.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-amber-700 hover:bg-amber-800">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Gaan na tuisblad
              </Link>
            </Button>
            <BackButton>Gaan terug</BackButton>
          </div>
        </div>

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
                <Search className="h-6 w-6 text-amber-700" />
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
              <CardTitle>Kontak Ons</CardTitle>
              <CardDescription>Laat weet ons as iets nie werk nie</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/kontakbesonderhede">Kontak besonderhede</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted-foreground">
            As jy hier uitgekom het vanaf ons webwerf, kontak ons asseblief sodat ons die skakel kan regmaak.
          </p>
        </div>
      </div>
    </div>
  )
}
