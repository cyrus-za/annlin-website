import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Mail, Phone, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MarkdownContent } from '@/components/content/MarkdownContent'
import { ServiceGroupGallery } from '@/components/public/ServiceGroupGallery'
import { prisma } from '@/lib/db'
import {
  createServiceGroupExcerpt,
  extractTrailingMarkdownImageGallery,
  normalizeServiceGroupContent,
} from '@/lib/public-content'

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
    description: createServiceGroupExcerpt(serviceGroup.description, serviceGroup.name, 160),
  }
}

export default async function ServiceGroupDetailPage({ params }: PageProps) {
  const { slug } = await params

  const serviceGroup = await prisma.serviceGroup.findUnique({
    where: { slug },
    include: { galleryPhotos: { orderBy: { displayOrder: 'asc' } } },
  })

  if (!serviceGroup || !serviceGroup.isActive) {
    notFound()
  }

  const normalizedContent = normalizeServiceGroupContent(
    serviceGroup.description,
    serviceGroup.name
  )
  const { content: bodyContent, images: trailingImages } =
    extractTrailingMarkdownImageGallery(normalizedContent)
  const galleryPhotos = serviceGroup.galleryPhotos.length > 0
    ? serviceGroup.galleryPhotos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        alt: photo.alt,
        caption: photo.caption,
      }))
    : trailingImages.map((photo, index) => ({
        id: `legacy-${index}`,
        url: photo.url,
        alt: photo.alt,
        caption: null,
      }))
  const bannerUrl = serviceGroup.bannerUrl || serviceGroup.thumbnailUrl

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative overflow-hidden border-b bg-stone-950 text-white">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-amber-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/55 to-stone-950/30" />

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Button asChild variant="ghost" className="mb-8 -ml-4 text-white hover:bg-white/10 hover:text-white">
            <Link href="/diensgroepe">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Terug na diensgroepe
            </Link>
          </Button>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="rounded-full border-white/40 bg-white/10 text-white">
                {serviceGroup.category === 'DIAKONIE' ? 'Diakonie' : 'Ander diensgroep'}
              </Badge>
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              {serviceGroup.name}
            </h1>
            <p className="max-w-3xl text-xl leading-8 text-stone-100">
              Kontak die kerkkantoor of die diensgroep se kontakpersoon om betrokke te raak.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
          <article className="min-w-0 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
            <MarkdownContent markdown={bodyContent} />
          </article>

          <aside className="min-w-0 space-y-6">
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
                <Link href="/kontak">Kontak kerkkantoor</Link>
              </Button>
            </div>
            {galleryPhotos.length > 0 ? (
              <ServiceGroupGallery photos={galleryPhotos} groupName={serviceGroup.name} />
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  )
}
