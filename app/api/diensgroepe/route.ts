import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { requireAuth } from '@/lib/auth-config'

// Validation schemas
const createServiceGroupSchema = z.object({
  name: z.string().min(1, "Naam is verplig"),
  description: z.string().min(1, "Beskrywing is verplig"),
  contactPerson: z.string().min(1, "Kontak persoon is verplig"),
  contactEmail: z.string().email("Ongeldige e-pos adres"),
  contactPhone: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  isActive: z.boolean().default(true),
})

const updateServiceGroupSchema = createServiceGroupSchema.partial()

// GET /api/diensgroepe - List service groups
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
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
    }
    
    const result = await safeDatabaseOperation(async () => {
      const [serviceGroups, total] = await Promise.all([
        prisma.serviceGroup.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
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
    
    const result = await safeDatabaseOperation(async () => {
      const serviceGroup = await prisma.serviceGroup.create({
        data: validatedData,
      })
      
      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          entityType: 'ServiceGroup',
          entityId: serviceGroup.id,
          changes: validatedData,
        },
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
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
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
