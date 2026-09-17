import { NextRequest, NextResponse } from 'next/server'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { format } from 'date-fns'
import type { Event, EventCategory, Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/auth-config'
import { EventsService, type RecurringEventData } from '@/lib/services/events'
import { z } from 'zod'

const recurringEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().max(300).optional(),
  categoryId: z.string().min(1),
  recurringPattern: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'FIRST_WEEKDAY_MONTHLY', 'YEARLY']),
  sermonUrl: z.string().url().or(z.string().regex(/^\/[^\s]*$/)).optional().or(z.literal('')),
  endRecurrence: z.string().datetime(),
  maxOccurrences: z.number().int().min(1).max(366).optional(),
})

type ExportEvent = Event & { category: Pick<EventCategory, 'id' | 'name' | 'color'> }

// Generate iCal format
function generateICalEvent(event: ExportEvent): string {
  const formatDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss'Z'")
  }

  const startDate = new Date(event.startDate)
  const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000) // Default 1 hour
  const now = new Date()

  const icalEvent = [
    'BEGIN:VEVENT',
    `UID:${event.id}@annlin-gemeente.co.za`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
  ]

  if (event.location) {
    icalEvent.push(`LOCATION:${event.location}`)
  }

  if (event.sermonUrl) {
    icalEvent.push(`URL:${event.sermonUrl}`)
  }

  // Add categories
  icalEvent.push(`CATEGORIES:${event.category.name}`)

  // Add recurring rule if applicable
  if (event.isRecurring && event.recurringPattern && !event.recurrenceGroupId) {
    let rrule = 'RRULE:FREQ='
    switch (event.recurringPattern) {
      case 'WEEKLY':
        rrule += 'WEEKLY'
        break
      case 'BIWEEKLY':
        rrule += 'WEEKLY;INTERVAL=2'
        break
      case 'MONTHLY':
        rrule += 'MONTHLY'
        break
      case 'FIRST_WEEKDAY_MONTHLY':
        rrule += 'MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=1'
        break
      case 'YEARLY':
        rrule += 'YEARLY'
        break
    }
    icalEvent.push(rrule)
  }

  icalEvent.push('END:VEVENT')
  
  return icalEvent.join('\r\n')
}

// GET /api/events/export - Export events as iCal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')
    
    const result = await safeDatabaseOperation(async () => {
      const where: Prisma.EventWhereInput = {}
      
      if (startDate || endDate) {
        where.startDate = {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {}),
        }
      }
      
      if (categoryId) {
        where.categoryId = categoryId
      }
      
      const events = await prisma.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      })
      
      return events
    }, 'Fetch events for export')
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Kon nie gebeure laai vir uitvoer nie' },
        { status: 500 }
      )
    }
    
    const events = result.data
    
    // Generate iCal content
    const icalHeader = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Annlin Gemeente//Calendar//AF',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Annlin Gemeente Jaarprogram',
      'X-WR-CALDESC:Eredienste en gebeure van Annlin Gemeente',
      'X-WR-TIMEZONE:Africa/Johannesburg',
    ].join('\r\n')
    
    const icalFooter = 'END:VCALENDAR'
    
    const icalEvents = events.map(generateICalEvent).join('\r\n')
    
    const icalContent = [icalHeader, icalEvents, icalFooter].join('\r\n')
    
    // Set appropriate headers for iCal download
    const headers = new Headers({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="annlin-gemeente-kalender-${format(new Date(), 'yyyy-MM-dd')}.ics"`,
    })
    
    return new Response(icalContent, { headers })
    
  } catch (error) {
    console.error('Events export error:', error)
    return NextResponse.json(
      { error: 'Kon nie kalender uitvoer nie' },
      { status: 500 }
    )
  }
}

// POST /api/events/export - Generate recurring events
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    
    // Only admins and editors can generate recurring events
    if (!['ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Onvoldoende regte om herhalende gebeure te skep' },
        { status: 403 }
      )
    }
    
    const body = recurringEventSchema.parse(await request.json())

    const startDate = new Date(body.startDate)
    const endDate = body.endDate ? new Date(body.endDate) : undefined
    const endRecurrence = new Date(body.endRecurrence)
    if ((endDate && endDate <= startDate) || endRecurrence < startDate) {
      return NextResponse.json({ error: 'Die herhalingsdatums is ongeldig' }, { status: 400 })
    }
    
    const recurringEventData: RecurringEventData = {
      title: body.title,
      description: body.description,
      startDate,
      endDate,
      location: body.location,
      categoryId: body.categoryId,
      recurringPattern: body.recurringPattern,
      sermonUrl: body.sermonUrl,
      endRecurrence,
      maxOccurrences: body.maxOccurrences,
    }
    
    const result = await EventsService.generateRecurringEvents(recurringEventData, user.id)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      message: `${result.eventsCreated} herhalende gebeure suksesvol geskep`,
      eventsCreated: result.eventsCreated,
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Die herhalende gebeurtenis se besonderhede is ongeldig' }, { status: 400 })
    }
    console.error('Recurring events generation error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
