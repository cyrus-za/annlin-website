import type { Metadata } from 'next'
import { getPublicContentPage } from '@/lib/content-pages.server'
import { readContentList, readContentText } from '@/lib/content-page-definitions'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Gebruiksvoorwaardes | Annlin Gemeente',
  description: 'Gebruiksvoorwaardes vir die Annlin Gemeente webwerf.',
}

export default async function TermsPage() {
  const { sections } = await getPublicContentPage('gebruiksvoorwaardes')

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{readContentText(sections, 'body.title')}</h1>
          <div className="mt-8 space-y-6 rounded-lg border bg-white p-6 text-muted-foreground sm:p-8">
            {readContentList(sections, 'body.paragraphs').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
