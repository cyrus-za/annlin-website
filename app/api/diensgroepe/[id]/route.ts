import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { requireAuth } from '@/lib/auth-config'
import { slugify } from '@/lib/slug'
import { createContentRevision } from '@/lib/services/revisions'
import { serviceGroupGalleryInputSchema } from '@/lib/service-group-gallery'

// Validation schema
const updateServiceGroupSchema = z.object({
  name: z.string().min(1, "Naam is verplig").optional(),
  slug: z.string().optional(),
  description: z.string().min(1, "Beskrywing is verplig").optional(),
  category: z.enum(['DIAKONIE', 'OTHER']).optional(),
  contactPerson: z.string().min(1, "Kontak persoon is verplig").optional(),
  contactEmail: z.string().email("Ongeldige e-pos adres").optional(),
  contactPhone: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  galleryPhotos: serviceGroupGalleryInputSchema.optional(),
})

// GET /api/diensgroepe/[id] - Get single service group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth()
    const { id } = await params

    if (!['ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Onvoldoende regte' }, { status: 403 })
    }
    
    const result = await safeDatabaseOperation(async () => {
      const serviceGroup = await prisma.serviceGroup.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              contactSubmissions: true,
            },
          },
          contactSubmissions: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              email: true,
              subject: true,
              status: true,
              createdAt: true,
            },
          },
          galleryPhotos: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      })
      
      if (!serviceGroup) {
        throw new Error('Diensgroep nie gevind nie')
      }

      return serviceGroup
    }, 'Fetch service group')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 500 }
      )
    }
    
    return NextResponse.json(result.data)
    
  } catch (error) {
    console.error('Service group GET error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}

// PUT /api/diensgroepe/[id] - Update service group
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Onvoldoende regte om diensgroepe te wysig' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateServiceGroupSchema.parse(body)
    const { galleryPhotos, ...serviceGroupFields } = validatedData
    const data = {
      ...serviceGroupFields,
      ...(serviceGroupFields.slug ? { slug: slugify(serviceGroupFields.slug) } : {}),
    }
    
    const result = await safeDatabaseOperation(async () => {
      // Get current service group for audit log
      const updatedServiceGroup = await prisma.$transaction(async (tx) => {
        const currentServiceGroup = await tx.serviceGroup.findUnique({
          where: { id },
          include: { galleryPhotos: { orderBy: { displayOrder: 'asc' } } },
        })

        if (!currentServiceGroup) {
          throw new Error('Diensgroep nie gevind nie')
        }

        await tx.serviceGroup.update({ where: { id }, data })

        if (galleryPhotos !== undefined) {
          await tx.serviceGroupPhoto.deleteMany({ where: { serviceGroupId: id } })
          if (galleryPhotos.length > 0) {
            await tx.serviceGroupPhoto.createMany({
              data: galleryPhotos.map((photo, displayOrder) => ({
                id: photo.id || crypto.randomUUID(),
                serviceGroupId: id,
                url: photo.url,
                pathname: photo.pathname || null,
                filename: photo.filename,
                mimeType: photo.mimeType,
                size: photo.size,
                alt: photo.alt,
                caption: photo.caption || null,
                displayOrder,
              })),
            })

            for (const photo of galleryPhotos) {
              if (!photo.pathname || photo.size <= 0) continue
              const existingAsset = await tx.uploadedAsset.findFirst({
                where: { pathname: photo.pathname },
                select: { id: true },
              })
              if (!existingAsset) {
                await tx.uploadedAsset.create({
                  data: {
                    url: photo.url,
                    pathname: photo.pathname,
                    filename: photo.filename,
                    mimeType: photo.mimeType,
                    size: photo.size,
                    purpose: 'service-group-gallery',
                  },
                })
              }
            }
          }
        }

        const refreshedServiceGroup = await tx.serviceGroup.findUnique({
          where: { id },
          include: { galleryPhotos: { orderBy: { displayOrder: 'asc' } } },
        })
        if (!refreshedServiceGroup) throw new Error('Diensgroep nie gevind nie')

        const changes = Object.keys(data).reduce((acc, key) => {
          const typedKey = key as keyof typeof data
          if (data[typedKey] !== undefined) {
            acc[key] = {
              from: currentServiceGroup[typedKey as keyof typeof currentServiceGroup],
              to: data[typedKey],
            }
          }
          return acc
        }, {} as Record<string, unknown>)
        if (galleryPhotos !== undefined) {
          changes.galleryPhotos = {
            from: currentServiceGroup.galleryPhotos.map(({ url, alt, caption, displayOrder }) => ({ url, alt, caption, displayOrder })),
            to: galleryPhotos.map(({ url, alt, caption, displayOrder }) => ({ url, alt, caption, displayOrder })),
          }
        }

        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: 'UPDATE',
            entityType: 'ServiceGroup',
            entityId: id,
            changes,
          },
        })

        return refreshedServiceGroup
      })
      await createContentRevision({
        entityType: 'ServiceGroup',
        entityId: id,
        snapshot: updatedServiceGroup,
        createdBy: user.id,
      })
      
      return updatedServiceGroup
    }, 'Update service group')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 500 }
      )
    }
    
    return NextResponse.json(result.data)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validasie fout',
          details: error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }
    
    console.error('Service group PUT error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}

// DELETE /api/diensgroepe/[id] - Delete service group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    
    // Only admins can delete service groups
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Slegs administrateurs kan diensgroepe verwyder' },
        { status: 403 }
      )
    }
    
    const result = await safeDatabaseOperation(async () => {
      // Get current service group for audit log
      const serviceGroup = await prisma.serviceGroup.findUnique({
        where: { id },
      })
      
      if (!serviceGroup) {
        throw new Error('Diensgroep nie gevind nie')
      }
      
      // Check if service group has contact submissions
      const submissionCount = await prisma.contactSubmission.count({
        where: { serviceGroupId: id },
      })
      
      if (submissionCount > 0) {
        throw new Error(`Kan nie diensgroep verwyder nie - ${submissionCount} kontaknavrae is gekoppel`)
      }
      
      // Delete service group
      await prisma.serviceGroup.delete({
        where: { id },
      })
      
      // Log the deletion
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DELETE',
          entityType: 'ServiceGroup',
          entityId: id,
          changes: { deletedServiceGroup: serviceGroup },
        },
      })
      
      return { success: true }
    }, 'Delete service group')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 400 }
      )
    }
    
    return NextResponse.json({ message: 'Diensgroep suksesvol verwyder' })
    
  } catch (error) {
    console.error('Service group DELETE error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
