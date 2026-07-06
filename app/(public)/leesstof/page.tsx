import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leesstof | Annlin Gemeente',
  description: 'Leesstof, preeksamevattings en geloofsmateriaal van Annlin Gemeente.',
}

const readingLinks = [
  {
    title: 'Leesstof',
    description: 'Algemene leesstof en geloofsmateriaal.',
    legacyUrl: 'https://www.annlin.co.za/leesstof-2/',
  },
  {
    title: 'Preek Samevattings',
    description: 'Samevattings en notas van preke.',
    legacyUrl: 'https://www.annlin.co.za/preke-op-skrif/',
  },
  {
    title: 'Oordenkings: Ons gesels oor Jesus',
    description: 'Oordenkings en geloofsgesprekke.',
    legacyUrl: 'https://www.annlin.co.za/oordenkings-ons-gesels-oor-jesus/',
  },
  {
    title: 'Kinderwerkkaarte',
    description: 'Werkkaarte en materiaal vir kinders.',
    legacyUrl: 'https://www.annlin.co.za/kinderwerkkaarte/',
  },
  {
    title: 'Ek wil weet',
    description: 'Antwoorde en toerusting oor geloofsvrae.',
    legacyUrl: 'https://www.annlin.co.za/ek-wil-weet/',
  },
]

export default function ReadingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <BookOpen className="h-6 w-6 text-amber-700" />
            </div>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Leesstof</h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Leesstof, preeksamevattings en toerustingsmateriaal. Hierdie argief word tans
              vanaf die ou WordPress-webwerf oorgebring.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {readingLinks.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="text-amber-900">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{item.description}</p>
                  <Button asChild variant="outline" className="w-full">
                    <a href={item.legacyUrl} target="_blank" rel="noopener noreferrer">
                      Maak argief oop
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
