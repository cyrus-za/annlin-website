import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gebruiksvoorwaardes | Annlin Gemeente',
  description: 'Gebruiksvoorwaardes vir die Annlin Gemeente webwerf.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground">Gebruiksvoorwaardes</h1>
          <div className="mt-8 space-y-6 rounded-lg border bg-white p-8 text-muted-foreground">
            <p>
              Die inhoud op hierdie webwerf word verskaf as openbare gemeente-inligting vir
              Gereformeerde Kerk Pretoria-Annlin.
            </p>
            <p>
              Ons probeer om inligting akkuraat en op datum te hou, maar eredienstye,
              jaarprogram-inskrywings en kontakbesonderhede kan verander. Kontak die
              kerkkantoor indien jy bevestiging benodig.
            </p>
            <p>
              Eksterne skakels, soos YouTube en Kerkdienstgemist, word deur derde partye
              bestuur en val onder hul eie bepalings.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
