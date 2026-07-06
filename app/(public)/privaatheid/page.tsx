import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privaatheid | Annlin Gemeente',
  description: 'Privaatheidsinligting vir die Annlin Gemeente webwerf.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground">Privaatheid</h1>
          <div className="mt-8 space-y-6 rounded-lg border bg-white p-8 text-muted-foreground">
            <p>
              Hierdie webwerf publiseer gemeente-inligting, diensgroepe, eredienstye,
              uitsendings en kontakbesonderhede. Ons vra slegs persoonlike inligting wanneer
              jy self 'n kontakvorm invul of met die kerkkantoor kommunikeer.
            </p>
            <p>
              Inligting wat deur kontakvorms gestuur word, word gebruik om jou navraag te
              hanteer en word nie vir bemarking aan derde partye verkoop nie.
            </p>
            <p>
              Vir enige versoek oor persoonlike inligting, kontak die kerkkantoor by
              kerkkantoor@annlin.co.za.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
