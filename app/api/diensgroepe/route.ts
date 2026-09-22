import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth-config'
import { slugify } from '@/lib/slug'
import { createContentRevision } from '@/lib/services/revisions'
import { serviceGroupGalleryInputSchema } from '@/lib/service-group-gallery'

// Validation schemas
const createServiceGroupSchema = z.object({
  name: z.string().min(1, "Naam is verplig"),
  slug: z.string().optional(),
  description: z.string().min(1, "Beskrywing is verplig"),
  category: z.enum(['DIAKONIE', 'OTHER']).default('OTHER'),
  contactPerson: z.string().min(1, "Kontak persoon is verplig"),
  contactEmail: z.string().email("Ongeldige e-pos adres"),
  contactPhone: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  galleryPhotos: serviceGroupGalleryInputSchema.default([]),
})

const updateServiceGroupSchema = createServiceGroupSchema.partial()

// GET /api/diensgroepe - List service groups
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const category = searchParams.get('category')
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    } else if (!includeInactive || user?.role !== 'ADMIN') {
      where.isActive = true
    }

    if (category === 'DIAKONIE' || category === 'OTHER') {
      where.category = category
    }
    const orderBy =
      sortBy === 'displayOrder'
        ? [{ displayOrder: sortOrder as 'asc' | 'desc' }, { name: 'asc' as const }]
        : { [sortBy]: sortOrder }

    const result = await safeDatabaseOperation(async () => {
      const [serviceGroups, total] = await Promise.all([
        prisma.serviceGroup.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            _count: {
              select: {
                contactSubmissions: true,
              },
            },
          },
        }),
        prisma.serviceGroup.count({ where }),
      ])
      
      return {
        serviceGroups,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }, 'Fetch service groups')
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Kon nie diensgroepe laai nie' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result.data)
    
  } catch (error) {
    console.error('Service groups GET error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}

// POST /api/diensgroepe - Create service group
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    
    // Only admins and editors can create service groups
    if (!['ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Onvoldoende regte om diensgroepe te skep' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = createServiceGroupSchema.parse(body)
    const { galleryPhotos, ...serviceGroupFields } = validatedData
    
    const result = await safeDatabaseOperation(async () => {
      const slug = slugify(serviceGroupFields.slug || serviceGroupFields.name)
      const serviceGroup = await prisma.$transaction(async (tx) => {
        const created = await tx.serviceGroup.create({
          data: {
            ...serviceGroupFields,
            slug,
            galleryPhotos: galleryPhotos.length > 0
              ? {
                  create: galleryPhotos.map((photo, displayOrder) => ({
                    url: photo.url,
                    pathname: photo.pathname || null,
                    filename: photo.filename,
                    mimeType: photo.mimeType,
                    size: photo.size,
                    alt: photo.alt,
                    caption: photo.caption || null,
                    displayOrder,
                  })),
                }
              : undefined,
          },
          include: { galleryPhotos: { orderBy: { displayOrder: 'asc' } } },
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

        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: 'CREATE',
            entityType: 'ServiceGroup',
            entityId: created.id,
            changes: created,
          },
        })
        return created
      })
      await createContentRevision({
        entityType: 'ServiceGroup',
        entityId: serviceGroup.id,
        snapshot: serviceGroup,
        createdBy: user.id,
      })
      
      return serviceGroup
    }, 'Create service group')
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Kon nie diensgroep skep nie' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result.data, { status: 201 })
    
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
    
    console.error('Service groups POST error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
