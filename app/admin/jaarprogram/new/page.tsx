'use client'

import { useRouter } from 'next/navigation'
import { EventForm } from '@/components/admin/EventForm'
import { showSuccessToast } from '@/lib/toast-helpers'

export default function NewEventPage() {
  const router = useRouter()

  const handleSuccess = () => {
    showSuccessToast('Gebeurtenis geskep!', 'Die nuwe gebeurtenis is suksesvol geskep.')
    router.push('/admin/jaarprogram')
  }

  const handleCancel = () => {
    router.push('/admin/jaarprogram')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuwe Gebeurtenis</h1>
        <p className="mt-2 text-gray-600">
          Voeg 'n nuwe gebeurtenis by die kerk kalender.
        </p>
      </div>

      <EventForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
