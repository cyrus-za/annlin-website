import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { requireAuth } from '@/lib/auth-config'
import { slugify } from '@/lib/slug'
import { createContentRevision } from '@/lib/services/revisions'

const contentPageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  sections: z.unknown(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const result = await safeDatabaseOperation(async () => {
    return prisma.contentPage.findMany({
      where: status === 'DRAFT' || status === 'PUBLISHED' || status === 'ARCHIVED' ? { status } : undefined,
      orderBy: { title: 'asc' },
    })
  }, 'Fetch content pages')

  if (!result.success) {
    return NextResponse.json({ error: 'Kon nie bladsye laai nie' }, { status: 500 })
  }

  return NextResponse.json({ pages: result.data })
}

export async function POST(request: NextRequest) {
  const { user } = await requireAuth()

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Onvoldoende regte' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = contentPageSchema.parse(body)
    const slug = slugify(data.slug)

    const result = await safeDatabaseOperation(async () => {
      const page = await prisma.contentPage.create({
        data: {
          ...data,
          slug,
          sections: data.sections as Prisma.InputJsonValue,
          publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
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
          action: 'CREATE',
          entityType: 'ContentPage',
          entityId: page.id,
          changes: page,
        },
      })

      return page
    }, 'Create content page')

    if (!result.success) {
      return NextResponse.json({ error: 'Kon nie bladsy skep nie' }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasie fout', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Kon nie bladsy skep nie' }, { status: 500 })
  }
}
