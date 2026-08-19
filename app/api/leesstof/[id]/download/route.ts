import { prisma } from '@/lib/db'

type RouteContext = {
  params: Promise<{ id: string }>
}

function downloadFilename(title: string) {
  const base = title
    .normalize('NFKC')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'publikasie'

  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`
}

function contentDisposition(filename: string) {
  const fallback = filename
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/["\\]/g, '') || 'publikasie.pdf'
  const encoded = encodeURIComponent(filename).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  )

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const material = await prisma.readingMaterial.findFirst({
    where: {
      id,
      status: 'PUBLISHED',
      isArchived: false,
      fileType: 'PDF',
      fileUrl: { not: null },
    },
    select: { title: true, fileUrl: true },
  })

  if (!material?.fileUrl) {
    return new Response('Publikasie nie gevind nie.', { status: 404 })
  }

  let sourceUrl: URL
  try {
    sourceUrl = new URL(material.fileUrl)
  } catch {
    return new Response('Ongeldige publikasieskakel.', { status: 502 })
  }

  if (sourceUrl.protocol !== 'https:') {
    return new Response('Ongeldige publikasieskakel.', { status: 502 })
  }

  let upstream: Response
  try {
    upstream = await fetch(sourceUrl, { cache: 'no-store' })
  } catch {
    return new Response('Die publikasie kon nie afgelaai word nie.', { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response('Die publikasie kon nie afgelaai word nie.', { status: 502 })
  }

  const headers = new Headers({
    'Content-Disposition': contentDisposition(downloadFilename(material.title)),
    'Content-Type': upstream.headers.get('content-type') || 'application/pdf',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  const contentLength = upstream.headers.get('content-length')
  if (contentLength) headers.set('Content-Length', contentLength)

  return new Response(upstream.body, { headers })
}
