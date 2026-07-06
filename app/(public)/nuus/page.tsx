import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ExternalLink, Newspaper } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuus | Annlin Gemeente',
  description: 'Nuus en aankondigings van Gereformeerde Kerk Pretoria-Annlin.',
}

const newsArchive = [
  {
    title: 'Nuus 2026',
    description: 'Die huidige jaar se gemeente-nuus en aankondigings.',
    legacyUrl: 'https://www.annlin.co.za/nuus-2025/',
  },
  {
    title: 'Nuus 2024',
    description: 'Argief van gemeente-nuus uit 2024.',
    legacyUrl: 'https://www.annlin.co.za/nuus-2024/',
  },
  {
    title: 'Nuus 2023',
    description: 'Argief van gemeente-nuus uit 2023.',
    legacyUrl: 'https://www.annlin.co.za/nuus-2023/',
  },
  {
    title: 'Nuus 2022',
    description: 'Argief van gemeente-nuus uit 2022.',
    legacyUrl: 'https://www.annlin.co.za/nuus-2022/',
  },
  {
    title: 'Nuus 2021',
    description: 'Argief van gemeente-nuus uit 2021.',
    legacyUrl: 'https://www.annlin.co.za/nuus-2021/',
  },
]

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Newspaper className="h-6 w-6 text-amber-700" />
            </div>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Nuus</h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Gemeente-nuus en aankondigings. Hierdie afdeling word tans vanaf die ou
              WordPress-argief oorgebring.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newsArchive.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Calendar className="h-5 w-5" />
                    {item.title}
                  </CardTitle>
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

          <div className="mt-10 rounded-lg border bg-white p-6">
            <h2 className="text-xl font-semibold text-foreground">Nuwe aankondigings</h2>
            <p className="mt-2 text-muted-foreground">
              Sodra die WordPress-inhoud finaal gemigreer is, sal nuwe artikels hier direk op
              die nuwe webwerf verskyn.
            </p>
            <Button asChild className="mt-6">
              <Link href="/kontakbesonderhede">Kontak die kerkkantoor</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
