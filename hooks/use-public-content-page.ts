'use client'

import * as React from 'react'
import {
  getContentPageDefinition,
  mergeContentPageSections,
} from '@/lib/content-page-definitions'

export function usePublicContentPage(slug: string): Record<string, unknown> {
  const definition = getContentPageDefinition(slug)
  if (!definition) throw new Error(`Unknown content page: ${slug}`)
  const pageDefinition = definition

  const [sections, setSections] = React.useState<Record<string, unknown>>(() => (
    mergeContentPageSections(pageDefinition, undefined)
  ))

  React.useEffect(() => {
    const controller = new AbortController()

    async function loadContent() {
      try {
        const response = await fetch(`/api/content-pages/public/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        })
        if (!response.ok) return

        const data = await response.json() as { sections?: unknown }
        setSections(mergeContentPageSections(pageDefinition, data.sections))
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error(`Could not load public content page ${slug}:`, error)
      }
    }

    loadContent()
    return () => controller.abort()
  }, [pageDefinition, slug])

  return sections
}
