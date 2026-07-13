import { NextResponse } from 'next/server'
import { getContentPageDefinition } from '@/lib/content-page-definitions'
import { getPublicContentPage } from '@/lib/content-pages.server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  if (!getContentPageDefinition(slug)) {
    return NextResponse.json({ error: 'Bladsy nie gevind nie' }, { status: 404 })
  }

  const page = await getPublicContentPage(slug)
  return NextResponse.json(
    {
      slug,
      title: page.title,
      description: page.description,
      sections: page.sections,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    },
  )
}
