import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Mail, Phone, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import { markdownToHtml } from '@/lib/tiptap-config'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const serviceGroup = await prisma.serviceGroup.findUnique({
    where: { slug },
    select: { name: true, description: true, isActive: true },
  })

  if (!serviceGroup || !serviceGroup.isActive) {
    return {}
  }

  return {
    title: `${serviceGroup.name} | Diensgroepe | Annlin Gemeente`,
    description: serviceGroup.description.slice(0, 160),
  }
}

export default async function ServiceGroupDetailPage({ params }: PageProps) {
  const { slug } = await params

  const serviceGroup = await prisma.serviceGroup.findUnique({
    where: { slug },
  })

  if (!serviceGroup || !serviceGroup.isActive) {
    notFound()
  }

  const bodyHtml = markdownToHtml(serviceGroup.description)

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="border-b bg-white py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="mb-6 -ml-4">
            <Link href="/diensgroepe">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Terug na diensgroepe
            </Link>
          </Button>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="rounded-full">
                {serviceGroup.category === 'DIAKONIE' ? 'Diakonie' : 'Ander diensgroep'}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {serviceGroup.name}
            </h1>
            <p className="max-w-3xl text-xl leading-8 text-muted-foreground">
              Kontak die kerkkantoor of die diensgroep se kontakpersoon om betrokke te raak.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
          <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
            <div
              className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-amber-800 prose-a:no-underline hover:prose-a:text-amber-950 prose-strong:text-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">Kontakpersoon</h2>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 text-amber-700" />
                  <span>{serviceGroup.contactPerson}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-amber-700" />
                  <a href={`mailto:${serviceGroup.contactEmail}`} className="break-all text-amber-800 hover:text-amber-950">
                    {serviceGroup.contactEmail}
                  </a>
                </div>
                {serviceGroup.contactPhone ? (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-amber-700" />
                    <a href={`tel:${serviceGroup.contactPhone}`} className="text-amber-800 hover:text-amber-950">
                      {serviceGroup.contactPhone}
                    </a>
                  </div>
                ) : null}
              </div>
              <Button asChild className="mt-6 w-full">
                <Link href="/kontakbesonderhede">Kontak kerkkantoor</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
