'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Archive, CalendarDays, ChevronLeft, ChevronRight, FileAudio, FileText, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  PublicationCategoryBadge,
  publicationCategoryPresentation,
} from '@/components/public/PublicationCategoryBadge'
import { cn } from '@/lib/utils'

type ResourceItem = {
  id: string
  title: string
  description: string | null
  fileType: string | null
  fileSize: number | null
  contentDate: string
  showDate: boolean
  isArchived: boolean
  category: string
}

const PAGE_SIZE = 12
const STORAGE_KEY = 'annlin-resource-filters'

function formatBytes(bytes: number | null) {
  if (!bytes) return null
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`
  return `${(bytes / 1_000_000).toFixed(1)} MB`
}

function formatDate(value: string, category: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`)
  return new Intl.DateTimeFormat('af-ZA', {
    day: category.includes('Maandblad') ? undefined : 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function ResourceLibrary({ items }: { items: ResourceItem[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const restored = React.useRef(false)
  const category = searchParams.get('versameling') || 'all'
  const year = searchParams.get('jaar') || 'all'
  const sort = searchParams.get('sorteer') === 'oudste' ? 'oudste' : 'nuutste'
  const query = (searchParams.get('soek') || '').trim()
  const showArchive = searchParams.get('argief') === '1'
  const requestedPage = Math.max(1, Number(searchParams.get('bladsy') || 1) || 1)
  const categories = [...new Set(items.map((item) => item.category))].sort((a, b) => a.localeCompare(b, 'af'))
  const years = [...new Set(items.map((item) => item.contentDate.slice(0, 4)))].sort().reverse()

  React.useEffect(() => {
    if (restored.current || searchParams.toString()) return
    restored.current = true

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, string>
      const params = new URLSearchParams()
      if (saved['category'] && saved['category'] !== 'all') params.set('versameling', saved['category'])
      if (saved['year'] && saved['year'] !== 'all') params.set('jaar', saved['year'])
      if (saved['sort'] === 'oudste') params.set('sorteer', 'oudste')
      if (params.size > 0) router.replace(`/leesstof?${params.toString()}`, { scroll: false })
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [router, searchParams])

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ category, year, sort }))
  }, [category, sort, year])

  const normalizedQuery = query.toLocaleLowerCase('af')
  const filtered = items
    .filter((item) => showArchive || !item.isArchived)
    .filter((item) => category === 'all' || item.category === category)
    .filter((item) => year === 'all' || item.contentDate.startsWith(year))
    .filter((item) =>
      !normalizedQuery || `${item.title} ${item.description || ''}`.toLocaleLowerCase('af').includes(normalizedQuery)
    )
    .sort((left, right) => {
      const comparison = left.contentDate.localeCompare(right.contentDate)
      return sort === 'oudste' ? comparison : -comparison
    })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(requestedPage, pageCount)
  const visibleItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function updateParams(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === 'all' || (key === 'sorteer' && value === 'nuutste')) params.delete(key)
      else params.set(key, value)
    }
    if (!('bladsy' in changes)) params.delete('bladsy')
    React.startTransition(() => router.replace(`/leesstof${params.size ? `?${params}` : ''}`, { scroll: false }))
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    updateParams({ soek: String(data.get('soek') || '').trim() || null })
  }

  function clearFilters() {
    localStorage.removeItem(STORAGE_KEY)
    React.startTransition(() => router.replace('/leesstof', { scroll: false }))
  }

  return (
    <section aria-labelledby="resource-library-heading" className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 id="resource-library-heading" className="text-3xl font-bold text-foreground sm:text-4xl">
            Publikasiebiblioteek
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Vind Die Fontein, liturgieë, preeksamevattings, kinderwerk en ander dokumente.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-6">
          <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input name="soek" defaultValue={query} className="pl-9" placeholder="Soek volgens titel of onderwerp" aria-label="Soek leesstof en publikasies" />
            </div>
            <Button type="submit">Soek</Button>
          </form>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-1.5 text-sm font-medium">
              Versameling
              <select value={category} onChange={(event) => updateParams({ versameling: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 font-normal">
                <option value="all">Alle versamelings</option>
                {categories.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Jaar
              <select value={year} onChange={(event) => updateParams({ jaar: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 font-normal">
                <option value="all">Alle jare</option>
                {years.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Sorteer
              <select value={sort} onChange={(event) => updateParams({ sorteer: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 font-normal">
                <option value="nuutste">Nuutste eerste</option>
                <option value="oudste">Oudste eerste</option>
              </select>
            </label>
            <label className="flex min-h-10 items-center gap-3 self-end rounded-md border border-input bg-background px-3 text-sm font-medium">
              <input type="checkbox" checked={showArchive} onChange={(event) => updateParams({ argief: event.target.checked ? '1' : null })} className="h-4 w-4 rounded border-input" />
              Wys historiese argief
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>{filtered.length} item{filtered.length === 1 ? '' : 's'} gevind</p>
            <button type="button" onClick={clearFilters} className="font-medium text-amber-900 underline underline-offset-4">Maak filters skoon</button>
          </div>
        </div>

        {visibleItems.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className={cn(
                  'flex min-w-0 h-full flex-col rounded-xl border border-t-4 border-stone-200 bg-white p-5 shadow-sm',
                  publicationCategoryPresentation(item.category).accent
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <PublicationCategoryBadge category={item.category} />
                  {item.isArchived ? <Badge variant="secondary"><Archive className="mr-1 h-3 w-3" /> Argief</Badge> : null}
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-snug text-foreground">{item.title}</h3>
                {item.showDate ? (
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(item.contentDate, item.category)}
                  </p>
                ) : null}
                {item.description ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-stone-100 pt-5">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.fileType === 'AUDIO' ? <FileAudio className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    {[item.fileType, formatBytes(item.fileSize)].filter(Boolean).join(' · ')}
                  </span>
                  <Button asChild size="sm"><Link href={`/leesstof/${item.id}`}>{item.fileType === 'AUDIO' ? 'Luister' : 'Lees'}</Link></Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-stone-300 p-10 text-center">
            <h3 className="text-lg font-semibold text-foreground">Geen leesstof of publikasies pas by hierdie filters nie</h3>
            <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>Maak filters skoon</Button>
          </div>
        )}

        {pageCount > 1 ? (
          <nav aria-label="Leesstof- en publikasiebladsye" className="mt-10 flex items-center justify-center gap-3">
            <Button variant="outline" disabled={page === 1} onClick={() => updateParams({ bladsy: String(page - 1) })}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Vorige
            </Button>
            <span className="text-sm text-muted-foreground">Bladsy {page} van {pageCount}</span>
            <Button variant="outline" disabled={page === pageCount} onClick={() => updateParams({ bladsy: String(page + 1) })}>
              Volgende <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </nav>
        ) : null}
      </div>
    </section>
  )
}
