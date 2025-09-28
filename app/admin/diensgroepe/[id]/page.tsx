'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DiensgroepeForm } from '@/components/admin/DiensgroepeForm'
import { showSuccessToast, showErrorToast } from '@/lib/toast-helpers'
import { Card, CardContent } from '@/components/ui/card'

interface ServiceGroup {
  id: string
  name: string
  description: string
  contactPerson: string
  contactEmail: string
  contactPhone?: string
  thumbnailUrl?: string
  isActive: boolean
}

export default function EditServiceGroupPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter()
  const [serviceGroup, setServiceGroup] = React.useState<ServiceGroup | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchServiceGroup = async () => {
      try {
        const response = await fetch(`/api/diensgroepe/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Diensgroep nie gevind nie')
          }
          throw new Error('Kon nie diensgroep laai nie')
        }
        
        const data = await response.json()
        setServiceGroup(data)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Kon nie diensgroep laai nie'
        setError(errorMessage)
        showErrorToast(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceGroup()
  }, [params.id])

  const handleSuccess = () => {
    showSuccessToast('Diensgroep opgedateer!', 'Die diensgroep is suksesvol opgedateer.')
    router.push('/admin/diensgroepe')
  }

  const handleCancel = () => {
    router.push('/admin/diensgroepe')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redigeer Diensgroep</h1>
          <p className="mt-2 text-gray-600">
            Laai diensgroep besonderhede...
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

  if (error || !serviceGroup) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redigeer Diensgroep</h1>
          <p className="mt-2 text-gray-600">
            Daar was 'n probleem om die diensgroep te laai.
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
                Kon nie diensgroep laai nie
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button
                onClick={() => router.push('/admin/diensgroepe')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Terug na Diensgroepe
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
        <h1 className="text-3xl font-bold text-gray-900">Redigeer Diensgroep</h1>
        <p className="mt-2 text-gray-600">
          Wysig besonderhede vir "{serviceGroup.name}".
        </p>
      </div>

      <DiensgroepeForm
        initialData={serviceGroup}
        serviceGroupId={serviceGroup.id}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
