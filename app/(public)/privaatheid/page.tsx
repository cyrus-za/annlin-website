import type { Metadata } from 'next'
import { APP_CONFIG } from '@/lib/constants'
import { getPublicContentPage } from '@/lib/content-pages.server'
import { readContentList, readContentText } from '@/lib/content-page-definitions'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Privaatheid | Annlin Gemeente',
  description: 'Privaatheidsinligting vir die Annlin Gemeente webwerf.',
}

export default async function PrivacyPage() {
  const { sections } = await getPublicContentPage('privaatheid')
  const paragraphs = readContentList(sections, 'body.paragraphs')

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground">{readContentText(sections, 'body.title')}</h1>
          <div className="mt-8 space-y-6 rounded-lg border bg-white p-8 text-muted-foreground">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>
                {paragraph.replaceAll('{{contactEmail}}', APP_CONFIG.email)}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
