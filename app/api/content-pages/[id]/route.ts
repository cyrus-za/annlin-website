import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { requireAuth } from '@/lib/auth-config'
import { slugify } from '@/lib/slug'
import { createContentRevision } from '@/lib/services/revisions'

const updateContentPageSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  sections: z.unknown().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await safeDatabaseOperation(async () => {
    const page = await prisma.contentPage.findUnique({ where: { id: params.id } })
    if (!page) throw new Error('Bladsy nie gevind nie')
    return page
  }, 'Fetch content page')

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.error.includes('nie gevind') ? 404 : 500 })
  }

  return NextResponse.json(result.data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user } = await requireAuth()

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Onvoldoende regte' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = updateContentPageSchema.parse(body)

    const result = await safeDatabaseOperation(async () => {
      const currentPage = await prisma.contentPage.findUnique({ where: { id: params.id } })
      if (!currentPage) throw new Error('Bladsy nie gevind nie')

      const { slug, sections, ...pageFields } = data

      const page = await prisma.contentPage.update({
        where: { id: params.id },
        data: {
          ...pageFields,
          ...(slug ? { slug: slugify(slug) } : {}),
          ...(sections !== undefined ? { sections: sections as Prisma.InputJsonValue } : {}),
          ...(data.status === 'PUBLISHED' && currentPage.status !== 'PUBLISHED' ? { publishedAt: new Date() } : {}),
        },
      })

      await createContentRevision({
        entityType: 'ContentPage',
        entityId: page.id,
        snapshot: page,
        createdBy: user.id,
      })

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE',
          entityType: 'ContentPage',
          entityId: page.id,
          changes: { before: currentPage, after: page },
        },
      })

      return page
    }, 'Update content page')

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.error.includes('nie gevind') ? 404 : 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasie fout', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Kon nie bladsy stoor nie' }, { status: 500 })
  }
}
