import type { ContentStatus, Prisma, ReadingMaterialFileType } from '@prisma/client'
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import Link from 'next/link'

import { deleteReadingMaterial } from '../_actions/content'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { requireAdmin } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createExcerpt } from '@/lib/public-content'

const PAGE_SIZE = 24
const ARCHIVE_CATEGORY = 'Argief uit WordPress'
const statuses: ContentStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED']
const fileTypes: ReadingMaterialFileType[] = ['PDF', 'DOC', 'AUDIO', 'LINK']

type AdminReadingSearchParams = {
  soek?: string | string[]
  kategorie?: string | string[]
  jaar?: string | string[]
  status?: string | string[]
  tipe?: string | string[]
  inhoud?: string | string[]
  sorteer?: string | string[]
  bladsy?: string | string[]
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function statusLabel(status: ContentStatus) {
  if (status === 'PUBLISHED') return 'Gepubliseer'
  if (status === 'DRAFT') return 'Konsep'
  return 'Argief'
}

function pageHref(values: Record<string, string>, page: number) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value && value !== 'all' && !(key === 'sorteer' && value === 'nuutste')) params.set(key, value)
  }
  if (page > 1) params.set('bladsy', String(page))
  return `/admin/leesstof${params.size ? `?${params.toString()}` : ''}`
}

export default async function AdminReadingPage({
  searchParams,
}: {
  searchParams: Promise<AdminReadingSearchParams>
}) {
  await requireAdmin()

  const requested = await searchParams
  const query = first(requested.soek).trim()
  const categoryId = first(requested.kategorie) || 'all'
  const year = /^\d{4}$/.test(first(requested.jaar)) ? first(requested.jaar) : 'all'
  const requestedStatus = first(requested.status)
  const status = statuses.includes(requestedStatus as ContentStatus) ? requestedStatus as ContentStatus : 'all'
  const requestedFileType = first(requested.tipe)
  const fileType = fileTypes.includes(requestedFileType as ReadingMaterialFileType)
    ? requestedFileType as ReadingMaterialFileType
    : 'all'
  const archive = ['current', 'historical'].includes(first(requested.inhoud)) ? first(requested.inhoud) : 'all'
  const sort = first(requested.sorteer) === 'oudste' ? 'oudste' : 'nuutste'
  const requestedPage = Math.max(1, Number(first(requested.bladsy)) || 1)

  const filters: Prisma.ReadingMaterialWhereInput[] = []
  if (query) {
    filters.push({
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    })
  }
  if (categoryId !== 'all') filters.push({ categoryId })
  if (year !== 'all') {
    filters.push({
      contentDate: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`),
      },
    })
  }
  if (status !== 'all') filters.push({ status })
  if (fileType !== 'all') filters.push({ fileType })
  if (archive === 'current') {
    filters.push({ isArchived: false, category: { name: { not: ARCHIVE_CATEGORY } } })
  }
  if (archive === 'historical') {
    filters.push({ OR: [{ isArchived: true }, { category: { name: ARCHIVE_CATEGORY } }] })
  }

  const where: Prisma.ReadingMaterialWhereInput = filters.length ? { AND: filters } : {}
  const [categories, dateRows, itemCount] = await Promise.all([
    prisma.readingMaterialCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.readingMaterial.findMany({ select: { contentDate: true }, distinct: ['contentDate'] }),
    prisma.readingMaterial.count({ where }),
  ])
  const years = [...new Set(dateRows.map((item) => item.contentDate.getUTCFullYear()))].sort((a, b) => b - a)
  const pageCount = Math.max(1, Math.ceil(itemCount / PAGE_SIZE))
  const page = Math.min(requestedPage, pageCount)
  const materials = await prisma.readingMaterial.findMany({
    where,
    include: { category: true },
    orderBy: sort === 'oudste'
      ? [{ contentDate: 'asc' }, { title: 'asc' }]
      : [{ contentDate: 'desc' }, { title: 'asc' }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  const filterValues = {
    soek: query,
    kategorie: categoryId,
    jaar: year,
    status,
    tipe: fileType,
    inhoud: archive,
    sorteer: sort,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leesstof & Publikasies</h1>
          <p className="mt-2 text-gray-600">Skep, filtreer en wysig publikasies, dokumente, klank en argiefinhoud.</p>
        </div>
        <Button asChild>
          <Link href="/admin/leesstof/new">
            <Plus className="mr-2 h-4 w-4" />
            Voeg Item By
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vind inhoud</CardTitle>
          <CardDescription>Argiefinhoud is slegs hier in die adminpaneel beskikbaar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/admin/leesstof" method="get" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              Soek
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input name="soek" defaultValue={query} className="pl-9" placeholder="Titel of inhoud" />
              </span>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Kategorie
              <select name="kategorie" defaultValue={categoryId} className="h-10 rounded-md border border-input bg-background px-3 font-normal">
                <option value="all">Alle kategorieë</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Jaar
              <select name="jaar" defaultValue={year} className="h-10 rounded-md border border-input bg-background px-3 font-normal">
                <option value="all">Alle jare</option>
                {years.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Publikasiestatus
              <select name="status" defaultValue={status} className="h-10 rounded-md border border-input bg-background px-3 font-normal">
                <option value="all">Alle statusse</option>
                {statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Lêertipe
              <select name="tipe" defaultValue={fileType} className="h-10 rounded-md border border-input bg-background px-3 font-normal">
                <option value="all">Alle tipes</option>
                {fileTypes.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Inhoud
              <select name="inhoud" defaultValue={archive} className="h-10 rounded-md border border-input bg-background px-3 font-normal">
                <option value="all">Alles</option>
                <option value="current">Huidige inhoud</option>
                <option value="historical">Historiese argief</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Sorteer
              <select name="sorteer" defaultValue={sort} className="h-10 rounded-md border border-input bg-background px-3 font-normal">
                <option value="nuutste">Nuutste eerste</option>
                <option value="oudste">Oudste eerste</option>
              </select>
            </label>
            <div className="flex flex-col gap-2 md:col-span-2 md:flex-row md:items-end xl:col-span-4">
              <Button type="submit">Pas filters toe</Button>
              <Button asChild type="button" variant="outline"><Link href="/admin/leesstof">Maak filters skoon</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leesstof & Publikasies</CardTitle>
          <CardDescription>{itemCount} item{itemCount === 1 ? '' : 's'} gevind</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {materials.map((item) => {
            const isHistorical = item.isArchived || item.category.name === ARCHIVE_CATEGORY
            return (
              <div key={item.id} className="flex flex-col gap-3 rounded-md border p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-900">{item.title}</h2>
                    <Badge variant="outline">{item.category.name}</Badge>
                    {item.fileType && <Badge variant="secondary">{item.fileType}</Badge>}
                    <Badge variant={item.status === 'PUBLISHED' ? 'default' : 'outline'}>{statusLabel(item.status)}</Badge>
                    {isHistorical && <Badge variant="outline">Histories</Badge>}
                  </div>
                  <p className="text-xs text-gray-500">{item.contentDate.toISOString().slice(0, 10)}</p>
                  <p className="line-clamp-2 text-sm text-gray-600">
                    {item.description ? createExcerpt(item.description, 220) : 'Geen beskrywing nie.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/leesstof/${item.id}`}>Redigeer</Link>
                  </Button>
                  <form action={deleteReadingMaterial}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button variant="destructive" size="sm" type="submit">Verwyder</Button>
                  </form>
                </div>
              </div>
            )
          })}
          {materials.length === 0 && (
            <p className="py-8 text-center text-gray-600">Geen leesstof of publikasies pas by hierdie filters nie.</p>
          )}
        </CardContent>
      </Card>

      {pageCount > 1 ? (
        <nav aria-label="Admin leesstofbladsye" className="flex items-center justify-center gap-3">
          <Button asChild={page > 1} variant="outline" disabled={page === 1}>
            {page > 1 ? (
              <Link href={pageHref(filterValues, page - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Vorige</Link>
            ) : <span><ChevronLeft className="mr-1 h-4 w-4" /> Vorige</span>}
          </Button>
          <span className="text-sm text-muted-foreground">Bladsy {page} van {pageCount}</span>
          <Button asChild={page < pageCount} variant="outline" disabled={page === pageCount}>
            {page < pageCount ? (
              <Link href={pageHref(filterValues, page + 1)}>Volgende <ChevronRight className="ml-1 h-4 w-4" /></Link>
            ) : <span>Volgende <ChevronRight className="ml-1 h-4 w-4" /></span>}
          </Button>
        </nav>
      ) : null}
    </div>
  )
}
