'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, Phone, Users } from 'lucide-react'

import { createExcerpt } from '@/lib/public-content'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ServiceGroup {
  id: string
  name: string
  slug: string
  description: string
  category: 'DIAKONIE' | 'OTHER'
  contactPerson: string
  contactEmail: string
  contactPhone?: string
  thumbnailUrl?: string
  bannerUrl?: string
  isActive: boolean
}

interface ServiceGroupsProps {
  limit?: number
  showAll?: boolean
}

const PUBLIC_SERVICE_GROUP_LIMIT = 100

export function ServiceGroups({ limit, showAll = false }: ServiceGroupsProps) {
  const [serviceGroups, setServiceGroups] = React.useState<ServiceGroup[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchServiceGroups = async () => {
      try {
        const requestedLimit = showAll ? PUBLIC_SERVICE_GROUP_LIMIT : (limit ?? PUBLIC_SERVICE_GROUP_LIMIT)
        const params = new URLSearchParams({
          isActive: 'true',
          limit: requestedLimit.toString(),
          sortBy: 'displayOrder',
          sortOrder: 'asc',
        })

        const response = await fetch(`/api/diensgroepe?${params}`)

        if (!response.ok) {
          throw new Error('Kon nie diensgroepe laai nie')
        }

        const data = await response.json()
        setServiceGroups(data.serviceGroups || [])
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Kon nie diensgroepe laai nie')
      } finally {
        setLoading(false)
      }
    }

    fetchServiceGroups()
  }, [limit, showAll])

  if (loading) {
    return showAll ? <ServiceGroupGridSkeleton /> : <ServiceGroupRailSkeleton />
  }

  if (error || serviceGroups.length === 0) {
    return (
      <section className={showAll ? 'bg-stone-50 py-12' : 'bg-white py-12'}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Diensgroepe</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {error || 'Geen aktiewe diensgroepe beskikbaar nie.'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  const diakonieGroups = serviceGroups.filter((group) => group.category === 'DIAKONIE')
  const otherGroups = serviceGroups.filter((group) => group.category === 'OTHER')

  return showAll ? (
    <section className="bg-stone-50 py-12">
      <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-6 lg:px-8">
        <ServiceGroupGridSection title="Diakonie" groups={diakonieGroups} />
        <ServiceGroupGridSection title="Ander diensgroepe" groups={otherGroups} />
      </div>
    </section>
  ) : (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-foreground">Diensgroepe</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Raak betrokke by die bedieningswerk van die gemeente.
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/diensgroepe">
              Alles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ServiceGroupRail title="Diakonie" groups={diakonieGroups} />
        <ServiceGroupRail title="Ander diensgroepe" groups={otherGroups} className="mt-8" />

        <div className="mt-8 sm:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href="/diensgroepe">
              Bekyk alle diensgroepe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function ServiceGroupGridSection({
  title,
  groups,
}: {
  title: string
  groups: ServiceGroup[]
}) {
  if (groups.length === 0) return null

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
          {groups.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
          >
            <Card className="h-full overflow-hidden border-stone-200 bg-white shadow-sm">
              <Link href={`/diensgroepe/${group.slug}`} className="block">
                <ServiceGroupImage group={group} className="aspect-[16/7]" />
              </Link>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl text-amber-900">{group.name}</CardTitle>
                    <Badge variant="outline" className="rounded-full">
                      {group.category === 'DIAKONIE' ? 'Diakonie' : 'Ander diensgroep'}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-base leading-7 text-muted-foreground">
                  {createExcerpt(group.description, 190)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-700" />
                    <span>{group.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-amber-700" />
                    <a
                      href={`mailto:${group.contactEmail}`}
                      className="truncate text-amber-800 hover:text-amber-950"
                    >
                      {group.contactEmail}
                    </a>
                  </div>
                  {group.contactPhone ? (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Phone className="h-4 w-4 text-amber-700" />
                      <a href={`tel:${group.contactPhone}`} className="text-amber-800 hover:text-amber-950">
                        {group.contactPhone}
                      </a>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="sm:flex-1">
                    <Link href={`/diensgroepe/${group.slug}`}>
                      Lees meer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="sm:flex-1">
                    <Link href="/kontakbesonderhede">Kontak kerkkantoor</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ServiceGroupRail({
  title,
  groups,
  className,
}: {
  title: string
  groups: ServiceGroup[]
  className?: string
}) {
  if (groups.length === 0) return null

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground">{groups.length} groepe</span>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-full gap-4">
          {groups.map((group, index) => (
            <motion.article
              key={group.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="flex w-[18rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            >
              <Link href={`/diensgroepe/${group.slug}`} className="block">
                <ServiceGroupImage group={group} className="aspect-[16/9]" />
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">{group.name}</h4>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {createExcerpt(group.description, 120)}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-amber-700" />
                </div>

                <div className="mt-4 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 shrink-0 text-amber-700" />
                  <span className="min-w-0 truncate">{group.contactPerson}</span>
                </div>

                <div className="mt-auto pt-5">
                  <Button
                    asChild
                    variant="ghost"
                    className="min-h-11 w-full justify-between gap-3 px-3 text-amber-900 hover:text-amber-950"
                  >
                    <Link href={`/diensgroepe/${group.slug}`}>
                      <span className="min-w-0 truncate">Meer oor {group.name}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  )
}

function ServiceGroupImage({
  group,
  className,
}: {
  group: ServiceGroup
  className: string
}) {
  const imageUrl = group.thumbnailUrl || group.bannerUrl

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 35vw, (min-width: 640px) 50vw, 18rem"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="h-full w-full bg-[linear-gradient(135deg,#f5f5f4,#e7e5e4)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/25 via-transparent to-transparent" />
    </div>
  )
}

function ServiceGroupRailSkeleton() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse rounded bg-stone-200" />
          <div className="mt-3 h-6 w-80 animate-pulse rounded bg-stone-100" />
        </div>
        <div className="space-y-8">
          {[0, 1].map((row) => (
            <div key={row}>
              <div className="mb-4 h-7 w-40 animate-pulse rounded bg-stone-200" />
              <div className="flex gap-4 overflow-hidden">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-44 w-[18rem] shrink-0 animate-pulse rounded-2xl border border-stone-200 bg-stone-50" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceGroupGridSkeleton() {
  return (
    <section className="bg-stone-50 py-12">
      <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-6 lg:px-8">
        {[0, 1].map((section) => (
          <div key={section}>
            <div className="mb-6 h-8 w-44 animate-pulse rounded bg-stone-200" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[0, 1, 2, 3].map((card) => (
                <div key={card} className="h-72 animate-pulse rounded-2xl border border-stone-200 bg-white" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ServiceGroupsCompact() {
  const [serviceGroups, setServiceGroups] = React.useState<ServiceGroup[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchServiceGroups = async () => {
      try {
        const params = new URLSearchParams({
          isActive: 'true',
          limit: '4',
          sortBy: 'displayOrder',
          sortOrder: 'asc',
        })

        const response = await fetch(`/api/diensgroepe?${params}`)

        if (response.ok) {
          const data = await response.json()
          setServiceGroups(data.serviceGroups || [])
        }
      } catch (error) {
        console.error('Error fetching service groups:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceGroups()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Diensgroepe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="mb-2 h-4 rounded bg-gray-200" />
                <div className="h-3 w-3/4 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (serviceGroups.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Diensgroepe</CardTitle>
        <CardDescription>Raak betrokke by ons bedienings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {serviceGroups.map((group) => (
            <div key={group.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="mb-1 text-sm font-medium text-gray-900">{group.name}</h4>
                  <p className="mb-2 line-clamp-2 text-xs text-gray-600">
                    {createExcerpt(group.description, 80)}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="mr-1 h-3 w-3" />
                    {group.contactPerson}
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/diensgroepe/${group.slug}`}>Bekyk</Link>
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/diensgroepe">Bekyk alles →</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
