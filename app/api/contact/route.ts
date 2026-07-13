import { NextRequest, NextResponse } from 'next/server'
import type { ContactSubmissionStatus } from '@prisma/client'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-config'
import { sendContactSubmissionNotification } from '@/lib/email'

// Validation schema
const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplig").max(100, "Naam mag nie langer as 100 karakters wees nie"),
  email: z.string().trim().email("Ongeldige e-pos adres"),
  phone: z.string().trim().max(40, "Telefoonnommer is te lank").optional(),
  subject: z.string().trim().min(1, "Onderwerp is verplig").max(200, "Onderwerp mag nie langer as 200 karakters wees nie"),
  message: z.string().trim().min(10, "Boodskap moet ten minste 10 karakters wees").max(2000, "Boodskap mag nie langer as 2000 karakters wees nie"),
  type: z.enum(['GENERAL', 'SERVICE_GROUP', 'SPECIFIC']),
  serviceGroupId: z.string().optional(),
}).superRefine((data, context) => {
  if (data.type === 'SERVICE_GROUP' && !data.serviceGroupId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['serviceGroupId'],
      message: 'Kies asseblief ’n diensgroep',
    })
  }
})

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = contactSubmissionSchema.parse(body)
    
    const result = await safeDatabaseOperation(async () => {
      // If it's a service group inquiry, verify the service group exists
      if (validatedData.type === 'SERVICE_GROUP' && validatedData.serviceGroupId) {
        const serviceGroup = await prisma.serviceGroup.findUnique({
          where: { id: validatedData.serviceGroupId },
        })
        
        if (!serviceGroup) {
          throw new Error('Diensgroep nie gevind nie')
        }
        
        if (!serviceGroup.isActive) {
          throw new Error('Hierdie diensgroep is tans nie aktief nie')
        }
      }
      
      // Create contact submission
      const submission = await prisma.contactSubmission.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          subject: validatedData.subject,
          message: validatedData.message,
          type: validatedData.type,
          serviceGroupId: validatedData.type === 'SERVICE_GROUP'
            ? validatedData.serviceGroupId
            : null,
          status: 'NEW',
        },
        include: {
          serviceGroup: {
            select: {
              name: true,
              contactPerson: true,
              contactEmail: true,
            },
          },
        },
      })
      
      return submission
    }, 'Create contact submission')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    const submission = result.data
    const emailSent = await sendContactSubmissionNotification({
      id: submission.id,
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      subject: submission.subject,
      type: submission.type,
      serviceGroupName: submission.serviceGroup?.name,
    })

    if (!emailSent) {
      console.error(`Contact notification email failed for submission ${submission.id}`)
    }

    return NextResponse.json(
      { 
        message: 'Jou boodskap is suksesvol ontvang!',
        id: submission.id,
      },
      { status: 201 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validasie fout',
          details: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        },
        { status: 400 }
      )
    }
    
    console.error('Contact submission error:', error)
    return NextResponse.json(
      { error: 'Kon nie boodskap stuur nie' },
      { status: 500 }
    )
  }
}

// GET /api/contact - List contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Meld asseblief aan' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Onvoldoende regte' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const take = Math.min(Math.max(Number(searchParams.get('limit')) || 50, 1), 100)
    const statusFilter: ContactSubmissionStatus | undefined =
      status === 'NEW' || status === 'READ' || status === 'REPLIED'
        ? status
        : undefined

    const submissions = await prisma.contactSubmission.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        serviceGroup: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Contact submissions GET error:', error)
    return NextResponse.json(
      { error: 'Kon nie kontakindienings laai nie' },
      { status: 500 }
    )
  }
}
