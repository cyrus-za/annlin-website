'use client'

import { useRouter } from 'next/navigation'
import { DiensgroepeForm } from '@/components/admin/DiensgroepeForm'
import { showSuccessToast } from '@/lib/toast-helpers'

export default function NewServiceGroupPage() {
  const router = useRouter()

  const handleSuccess = () => {
    showSuccessToast('Diensgroep geskep!', 'Die nuwe diensgroep is suksesvol geskep.')
    router.push('/admin/diensgroepe')
  }

  const handleCancel = () => {
    router.push('/admin/diensgroepe')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuwe Diensgroep</h1>
        <p className="mt-2 text-gray-600">
          Skep 'n nuwe diensgroep om lidmate te help om betrokke te raak.
        </p>
      </div>

      <DiensgroepeForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
