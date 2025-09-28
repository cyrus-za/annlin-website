'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { EventForm } from '@/components/admin/EventForm'
import { showSuccessToast, showErrorToast } from '@/lib/toast-helpers'
import { Card, CardContent } from '@/components/ui/card'

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate?: string
  location?: string
  categoryId: string
  isRecurring: boolean
  recurringPattern?: string
  sermonUrl?: string
  category: {
    id: string
    name: string
    color: string
  }
}

export default function EditEventPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter()
  const [event, setEvent] = React.useState<Event | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Gebeurtenis nie gevind nie')
          }
          throw new Error('Kon nie gebeurtenis laai nie')
        }
        
        const data = await response.json()
        setEvent(data)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Kon nie gebeurtenis laai nie'
        setError(errorMessage)
        showErrorToast(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id])

  const handleSuccess = () => {
    showSuccessToast('Gebeurtenis opgedateer!', 'Die gebeurtenis is suksesvol opgedateer.')
    router.push('/admin/jaarprogram')
  }

  const handleCancel = () => {
    router.push('/admin/jaarprogram')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redigeer Gebeurtenis</h1>
          <p className="mt-2 text-gray-600">
            Laai gebeurtenis besonderhede...
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <span className="ml-3 text-gray-600">Laai...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redigeer Gebeurtenis</h1>
          <p className="mt-2 text-gray-600">
            Daar was 'n probleem om die gebeurtenis te laai.
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Kon nie gebeurtenis laai nie
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button
                onClick={() => router.push('/admin/jaarprogram')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Terug na Kalender
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Redigeer Gebeurtenis</h1>
        <p className="mt-2 text-gray-600">
          Wysig besonderhede vir "{event.title}".
        </p>
      </div>

      <EventForm
        initialData={event}
        eventId={event.id}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
