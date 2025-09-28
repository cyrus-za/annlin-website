import { prisma, safeDatabaseOperation } from '@/lib/db'
import { addWeeks, addMonths, addYears, isBefore, format } from 'date-fns'

interface RecurringEventData {
  title: string
  description: string
  startDate: Date
  endDate?: Date
  location?: string
  categoryId: string
  recurringPattern: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  sermonUrl?: string
  endRecurrence?: Date // When to stop generating recurring events
  maxOccurrences?: number // Maximum number of occurrences
}

export class EventsService {
  /**
   * Generate recurring events based on pattern
   */
  static async generateRecurringEvents(
    baseEventData: RecurringEventData,
    userId: string
  ): Promise<{ success: boolean; eventsCreated?: number; error?: string }> {
    const result = await safeDatabaseOperation(async () => {
      const eventsToCreate: any[] = []
      const maxOccurrences = baseEventData.maxOccurrences || 52 // Default to 1 year of weekly events
      const endRecurrence = baseEventData.endRecurrence || addYears(baseEventData.startDate, 2) // Default to 2 years
      
      let currentStartDate = new Date(baseEventData.startDate)
      let currentEndDate = baseEventData.endDate ? new Date(baseEventData.endDate) : undefined
      let occurrenceCount = 0

      // Generate recurring events
      while (
        isBefore(currentStartDate, endRecurrence) && 
        occurrenceCount < maxOccurrences
      ) {
        eventsToCreate.push({
          title: baseEventData.title,
          description: baseEventData.description,
          startDate: new Date(currentStartDate),
          endDate: currentEndDate ? new Date(currentEndDate) : null,
          location: baseEventData.location,
          categoryId: baseEventData.categoryId,
          isRecurring: true,
          recurringPattern: baseEventData.recurringPattern,
          sermonUrl: baseEventData.sermonUrl,
        })

        // Calculate next occurrence
        switch (baseEventData.recurringPattern) {
          case 'WEEKLY':
            currentStartDate = addWeeks(currentStartDate, 1)
            if (currentEndDate) {
              currentEndDate = addWeeks(currentEndDate, 1)
            }
            break
          case 'MONTHLY':
            currentStartDate = addMonths(currentStartDate, 1)
            if (currentEndDate) {
              currentEndDate = addMonths(currentEndDate, 1)
            }
            break
          case 'YEARLY':
            currentStartDate = addYears(currentStartDate, 1)
            if (currentEndDate) {
              currentEndDate = addYears(currentEndDate, 1)
            }
            break
        }
        
        occurrenceCount++
      }

      // Create all events in a transaction
      const createdEvents = await prisma.$transaction(async (tx) => {
        const events = await Promise.all(
          eventsToCreate.map(eventData => 
            tx.event.create({ data: eventData })
          )
        )

        // Log the action
        await tx.auditLog.create({
          data: {
            userId,
            action: 'CREATE_RECURRING',
            entityType: 'Event',
            entityId: 'multiple',
            changes: {
              pattern: baseEventData.recurringPattern,
              eventsCreated: events.length,
              baseEvent: baseEventData,
            },
          },
        })

        return events
      })

      return { eventsCreated: createdEvents.length }
    }, 'Generate recurring events')

    return result.success 
      ? { success: true, eventsCreated: result.data.eventsCreated }
      : { success: false, error: result.error }
  }

  /**
   * Get events for a specific date range
   */
  static async getEventsForDateRange(
    startDate: Date,
    endDate: Date,
    categoryId?: string
  ): Promise<{ success: boolean; events?: any[]; error?: string }> {
    const result = await safeDatabaseOperation(async () => {
      const where: any = {
        startDate: {
          gte: startDate,
          lte: endDate,
        },
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
    }, 'Fetch events for date range')

    return result.success 
      ? { success: true, events: result.data }
      : { success: false, error: result.error }
  }

  /**
   * Get upcoming events (next N events from now)
   */
  static async getUpcomingEvents(
    limit: number = 10
  ): Promise<{ success: boolean; events?: any[]; error?: string }> {
    const result = await safeDatabaseOperation(async () => {
      const events = await prisma.event.findMany({
        where: {
          startDate: {
            gte: new Date(),
          },
        },
        take: limit,
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
    }, 'Fetch upcoming events')

    return result.success 
      ? { success: true, events: result.data }
      : { success: false, error: result.error }
  }

  /**
   * Delete all recurring events in a series
   */
  static async deleteRecurringSeries(
    baseEventId: string,
    userId: string
  ): Promise<{ success: boolean; eventsDeleted?: number; error?: string }> {
    const result = await safeDatabaseOperation(async () => {
      // Get the base event to understand the series
      const baseEvent = await prisma.event.findUnique({
        where: { id: baseEventId },
      })

      if (!baseEvent || !baseEvent.isRecurring) {
        throw new Error('Gebeurtenis is nie deel van \'n herhalende reeks nie')
      }

      // Find all events in the series (same title, category, and recurring pattern)
      const seriesEvents = await prisma.event.findMany({
        where: {
          title: baseEvent.title,
          categoryId: baseEvent.categoryId,
          isRecurring: true,
          recurringPattern: baseEvent.recurringPattern,
        },
      })

      // Delete all events in the series
      const deleteResult = await prisma.event.deleteMany({
        where: {
          id: {
            in: seriesEvents.map(e => e.id),
          },
        },
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DELETE_RECURRING_SERIES',
          entityType: 'Event',
          entityId: baseEventId,
          changes: {
            seriesDeleted: seriesEvents.length,
            baseEvent,
          },
        },
      })

      return { eventsDeleted: deleteResult.count }
    }, 'Delete recurring event series')

    return result.success 
      ? { success: true, eventsDeleted: result.data.eventsDeleted }
      : { success: false, error: result.error }
  }

  /**
   * Get event statistics
   */
  static async getEventStatistics(): Promise<{
    success: boolean
    stats?: {
      totalEvents: number
      upcomingEvents: number
      recurringEvents: number
      categoriesCount: number
      thisMonthEvents: number
    }
    error?: string
  }> {
    const result = await safeDatabaseOperation(async () => {
      const now = new Date()
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const [
        totalEvents,
        upcomingEvents,
        recurringEvents,
        categoriesCount,
        thisMonthEvents,
      ] = await Promise.all([
        prisma.event.count(),
        prisma.event.count({
          where: {
            startDate: {
              gte: now,
            },
          },
        }),
        prisma.event.count({
          where: {
            isRecurring: true,
          },
        }),
        prisma.eventCategory.count(),
        prisma.event.count({
          where: {
            startDate: {
              gte: startOfThisMonth,
              lte: endOfThisMonth,
            },
          },
        }),
      ])

      return {
        totalEvents,
        upcomingEvents,
        recurringEvents,
        categoriesCount,
        thisMonthEvents,
      }
    }, 'Fetch event statistics')

    return result.success 
      ? { success: true, stats: result.data }
      : { success: false, error: result.error }
  }
}
