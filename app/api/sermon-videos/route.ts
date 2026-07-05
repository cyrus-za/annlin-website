import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth-config'
import { createContentRevision } from '@/lib/services/revisions'

const sermonVideoSchema = z.object({
  title: z.string().min(1),
  preachedAt: z.string().datetime().optional().nullable(),
  preacher: z.string().optional(),
  description: z.string().optional(),
  videoUrl: z.string().url(),
  source: z.enum(['YOUTUBE', 'KERKDIENSTGEMIST', 'OTHER']).default('YOUTUBE'),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
})

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') || 12)
  const includeDrafts = searchParams.get('includeDrafts') === 'true' && user?.role === 'ADMIN'

  const result = await safeDatabaseOperation(async () => {
    return prisma.sermonVideo.findMany({
      where: includeDrafts ? undefined : { status: 'PUBLISHED' },
      orderBy: [{ isFeatured: 'desc' }, { preachedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    })
  }, 'Fetch sermon videos')

  if (!result.success) {
    return NextResponse.json({ error: 'Kon nie uitsendings laai nie' }, { status: 500 })
  }

  return NextResponse.json({ videos: result.data })
}

export async function POST(request: NextRequest) {
  const { user } = await requireAuth()

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Onvoldoende regte' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = sermonVideoSchema.parse(body)

    const result = await safeDatabaseOperation(async () => {
      const video = await prisma.sermonVideo.create({
        data: {
          ...data,
          preachedAt: data.preachedAt ? new Date(data.preachedAt) : null,
        },
      })

      await createContentRevision({
        entityType: 'SermonVideo',
        entityId: video.id,
        snapshot: video,
        createdBy: user.id,
      })

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          entityType: 'SermonVideo',
          entityId: video.id,
          changes: video,
        },
      })

      return video
    }, 'Create sermon video')

    if (!result.success) {
      return NextResponse.json({ error: 'Kon nie uitsending skep nie' }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasie fout', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Kon nie uitsending skep nie' }, { status: 500 })
  }
}
