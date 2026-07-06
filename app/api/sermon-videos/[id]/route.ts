import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { requireAuth } from '@/lib/auth-config'
import { createContentRevision } from '@/lib/services/revisions'

const updateSermonVideoSchema = z.object({
  title: z.string().min(1).optional(),
  preachedAt: z.string().datetime().optional().nullable(),
  preacher: z.string().optional(),
  description: z.string().optional(),
  videoUrl: z.string().url().optional(),
  source: z.enum(['YOUTUBE', 'KERKDIENSTGEMIST', 'OTHER']).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await requireAuth()
  const { id } = await params

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Onvoldoende regte' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = updateSermonVideoSchema.parse(body)

    const result = await safeDatabaseOperation(async () => {
      const currentVideo = await prisma.sermonVideo.findUnique({ where: { id } })
      if (!currentVideo) throw new Error('Uitsending nie gevind nie')

      const video = await prisma.sermonVideo.update({
        where: { id },
        data: {
          ...data,
          ...(data.preachedAt !== undefined ? { preachedAt: data.preachedAt ? new Date(data.preachedAt) : null } : {}),
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
          action: 'UPDATE',
          entityType: 'SermonVideo',
          entityId: video.id,
          changes: { before: currentVideo, after: video },
        },
      })

      return video
    }, 'Update sermon video')

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.error.includes('nie gevind') ? 404 : 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasie fout', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Kon nie uitsending stoor nie' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await requireAuth()
  const { id } = await params

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Onvoldoende regte' }, { status: 403 })
  }

  const result = await safeDatabaseOperation(async () => {
    const currentVideo = await prisma.sermonVideo.findUnique({ where: { id } })
    if (!currentVideo) throw new Error('Uitsending nie gevind nie')

    await prisma.sermonVideo.delete({ where: { id } })
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE',
        entityType: 'SermonVideo',
        entityId: id,
        changes: { deleted: currentVideo },
      },
    })

    return { success: true }
  }, 'Delete sermon video')

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.error.includes('nie gevind') ? 404 : 500 })
  }

  return NextResponse.json({ message: 'Uitsending verwyder' })
}
