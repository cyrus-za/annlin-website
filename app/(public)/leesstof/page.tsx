import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leesstof | Annlin Gemeente',
  description: 'Leesstof, preeksamevattings en geloofsmateriaal van Annlin Gemeente.',
}

export const revalidate = 300

function preview(value: string | null, maxLength = 800) {
  if (!value) return ''
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength).trim()}...`
}

export default async function ReadingPage() {
  const materials = await prisma.readingMaterial.findMany({
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  })

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
              Leesstof, preeksamevattings en toerustingsmateriaal.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {materials.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {materials.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-amber-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-muted-foreground">
                      {preview(item.description)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-xl font-semibold text-foreground">
                Geen leesstof beskikbaar nie
              </h2>
              <p className="mt-2 text-muted-foreground">
                Die nuwe webwerf het nog geen leesstof-items nie.
              </p>
              <Button asChild className="mt-6">
                <Link href="/kontakbesonderhede">Kontak die kerkkantoor</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
