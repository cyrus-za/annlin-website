'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/AdminForm'
import { showSuccessToast, showErrorToast, showDeleteConfirmationToast } from '@/lib/toast-helpers'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { af } from 'date-fns/locale'

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate?: string
  location?: string
  isRecurring: boolean
  recurringPattern?: string
  sermonUrl?: string
  category: {
    id: string
    name: string
    color: string
  }
}

interface EventCategory {
  id: string
  name: string
  color: string
  description?: string
  _count: {
    events: number
  }
}

export default function CalendarAdminPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [events, setEvents] = React.useState<Event[]>([])
  const [categories, setCategories] = React.useState<EventCategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null)
  const [showEventDialog, setShowEventDialog] = React.useState(false)
  const [view, setView] = React.useState<'calendar' | 'list'>('calendar')

  const fetchEvents = React.useCallback(async (date: Date) => {
    try {
      setLoading(true)
      const startDate = startOfMonth(date)
      const endDate = endOfMonth(date)
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: '100',
        sortBy: 'startDate',
        sortOrder: 'asc',
      })
      
      const [eventsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/events?${params}`),
        fetch('/api/events/categories')
      ])
      
      if (!eventsResponse.ok || !categoriesResponse.ok) {
        throw new Error('Kon nie data laai nie')
      }
      
      const eventsData = await eventsResponse.json()
      const categoriesData = await categoriesResponse.json()
      
      setEvents(eventsData.events || [])
      setCategories(categoriesData.categories || [])
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie kalender data laai nie')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchEvents(currentDate)
  }, [currentDate, fetchEvents])

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleEventView = (event: Event) => {
    setSelectedEvent(event)
    setShowEventDialog(true)
  }

  const handleEventEdit = (event: Event) => {
    router.push(`/admin/jaarprogram/events/${event.id}`)
  }

  const handleEventDelete = async (event: Event) => {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kon nie gebeurtenis verwyder nie')
      }
      
      showSuccessToast('Gebeurtenis verwyder!', `${event.title} is suksesvol verwyder.`)
      fetchEvents(currentDate)
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie gebeurtenis verwyder nie')
    }
  }

  // Get events for selected date
  const selectedDateEvents = selectedDate ? events.filter(event => {
    const eventDate = new Date(event.startDate)
    return eventDate.toDateString() === selectedDate.toDateString()
  }) : []

  // Get events that have dates (for calendar display)
  const eventDates = events.map(event => new Date(event.startDate))

  const columns = [
    {
      key: 'title' as keyof Event,
      label: 'Titel',
      sortable: true,
      render: (value: string, row: Event) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">
            {format(new Date(row.startDate), 'dd MMM yyyy HH:mm', { locale: af })}
          </div>
        </div>
      ),
    },
    {
      key: 'category' as keyof Event,
      label: 'Kategorie',
      render: (value: any) => (
        <Badge 
          style={{ backgroundColor: value.color + '20', color: value.color }}
          className="border-0"
        >
          {value.name}
        </Badge>
      ),
    },
    {
      key: 'location' as keyof Event,
      label: 'Lokasie',
      render: (value: string) => value || 'Nie gespesifiseer nie',
    },
    {
      key: 'isRecurring' as keyof Event,
      label: 'Herhalend',
      render: (value: boolean, row: Event) => (
        <div className="flex items-center space-x-2">
          <StatusBadge status={value ? 'Herhalend' : 'Eenmalig'} />
          {value && row.recurringPattern && (
            <Badge variant="outline" className="text-xs">
              {row.recurringPattern}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions' as keyof Event,
      label: 'Aksies',
    },
  ]

  const actions = [
    {
      label: 'Bekyk',
      onClick: handleEventView,
    },
    {
      label: 'Redigeer',
      onClick: handleEventEdit,
    },
    {
      label: 'Verwyder',
      onClick: (event: Event) => {
        showDeleteConfirmationToast(event.title, () => handleEventDelete(event))
      },
      variant: 'destructive' as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jaarprogram Bestuur</h1>
          <p className="mt-2 text-gray-600">
            Bestuur kerkgebeure en jaarlikse program
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('calendar')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Kalender
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
            >
              Lys
            </Button>
          </div>
          <Button onClick={() => router.push('/admin/jaarprogram/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Voeg Gebeurtenis By
          </Button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {format(currentDate, 'MMMM yyyy', { locale: af })}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentDate}
                  onMonthChange={setCurrentDate}
                  modifiers={{
                    event: eventDates,
                  }}
                  modifiersStyles={{
                    event: { 
                      backgroundColor: '#3B82F6', 
                      color: 'white',
                      fontWeight: 'bold',
                    },
                  }}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>

          {/* Event Details for Selected Date */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: af }) : 'Kies \'n Datum'}
                </CardTitle>
                <CardDescription>
                  {selectedDateEvents.length > 0 
                    ? `${selectedDateEvents.length} gebeurtenis${selectedDateEvents.length !== 1 ? 'se' : ''}`
                    : 'Geen gebeure vir hierdie datum nie'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => (
                      <div key={event.id} className="border-l-4 pl-4" style={{ borderColor: event.category.color }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              {event.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(event.startDate), 'HH:mm')}
                              {event.endDate && (
                                <> - {format(new Date(event.endDate), 'HH:mm')}</>
                              )}
                            </div>
                            {event.location && (
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEventView(event)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEventEdit(event)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Geen gebeure vir hierdie datum nie
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-4"
                      onClick={() => router.push('/admin/jaarprogram/new')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Voeg Gebeurtenis By
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Kategorieë</CardTitle>
                <CardDescription>
                  Gebeurtenis kategorieë en kleure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category._count.events}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* List View */
        <DataTable
          title="Alle Gebeure"
          description="Lys van alle gebeure in die kalender"
          data={events}
          columns={columns}
          actions={actions}
          searchable={true}
          searchPlaceholder="Soek gebeure..."
          onAdd={() => router.push('/admin/jaarprogram/new')}
          addButtonText="Voeg Gebeurtenis By"
          isLoading={loading}
          emptyStateText="Geen gebeure gevind nie."
        />
      )}

      {/* Event Detail Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              Gebeurtenis besonderhede
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Beskrywing</h4>
                  <p className="text-gray-600 text-sm">
                    {selectedEvent.description}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Datum:</span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(selectedEvent.startDate), 'dd MMMM yyyy', { locale: af })}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Tyd:</span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(selectedEvent.startDate), 'HH:mm')}
                      {selectedEvent.endDate && (
                        <> - {format(new Date(selectedEvent.endDate), 'HH:mm')}</>
                      )}
                    </span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">Lokasie:</span>
                      <span className="text-sm text-gray-600">
                        {selectedEvent.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <Badge 
                    style={{ backgroundColor: selectedEvent.category.color + '20', color: selectedEvent.category.color }}
                    className="border-0"
                  >
                    {selectedEvent.category.name}
                  </Badge>
                  {selectedEvent.isRecurring && (
                    <Badge variant="outline">
                      Herhalend - {selectedEvent.recurringPattern}
                    </Badge>
                  )}
                </div>
              </div>

              {selectedEvent.sermonUrl && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preek Opname</h4>
                  <Button asChild variant="outline" size="sm">
                    <a href={selectedEvent.sermonUrl} target="_blank" rel="noopener noreferrer">
                      Luister na Preek
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Maak Toe
            </Button>
            {selectedEvent && (
              <Button onClick={() => handleEventEdit(selectedEvent)}>
                <Edit className="mr-2 h-4 w-4" />
                Redigeer
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
