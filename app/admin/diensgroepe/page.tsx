'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/AdminForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { showSuccessToast, showErrorToast, showDeleteConfirmationToast } from '@/lib/toast-helpers'
import { Edit, Trash2, Eye, Users, Mail, Phone } from 'lucide-react'

interface ServiceGroup {
  id: string
  name: string
  description: string
  contactPerson: string
  contactEmail: string
  contactPhone?: string
  thumbnailUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    contactSubmissions: number
  }
}

export default function DiensgroepeListPage() {
  const router = useRouter()
  const [serviceGroups, setServiceGroups] = React.useState<ServiceGroup[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedServiceGroup, setSelectedServiceGroup] = React.useState<ServiceGroup | null>(null)
  const [showDetailDialog, setShowDetailDialog] = React.useState(false)
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  const fetchServiceGroups = React.useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
      })
      
      const response = await fetch(`/api/diensgroepe?${params}`)
      
      if (!response.ok) {
        throw new Error('Kon nie diensgroepe laai nie')
      }
      
      const data = await response.json()
      setServiceGroups(data.serviceGroups)
      setPagination({
        currentPage: data.pagination.page,
        totalPages: data.pagination.totalPages,
        total: data.pagination.total,
      })
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie diensgroepe laai nie')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchServiceGroups()
  }, [fetchServiceGroups])

  const handleView = (serviceGroup: ServiceGroup) => {
    setSelectedServiceGroup(serviceGroup)
    setShowDetailDialog(true)
  }

  const handleEdit = (serviceGroup: ServiceGroup) => {
    router.push(`/admin/diensgroepe/${serviceGroup.id}`)
  }

  const handleDelete = async (serviceGroup: ServiceGroup) => {
    try {
      const response = await fetch(`/api/diensgroepe/${serviceGroup.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kon nie diensgroep verwyder nie')
      }
      
      showSuccessToast('Suksesvol verwyder!', `${serviceGroup.name} is suksesvol verwyder.`)
      fetchServiceGroups(pagination.currentPage)
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie diensgroep verwyder nie')
    }
  }

  const handleToggleStatus = async (serviceGroup: ServiceGroup) => {
    try {
      const response = await fetch(`/api/diensgroepe/${serviceGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !serviceGroup.isActive,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Kon nie status wysig nie')
      }
      
      const statusText = serviceGroup.isActive ? 'gedeaktiveer' : 'geaktiveer'
      showSuccessToast('Status gewysig!', `${serviceGroup.name} is ${statusText}.`)
      fetchServiceGroups(pagination.currentPage)
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie status wysig nie')
    }
  }

  const columns = [
    {
      key: 'name' as keyof ServiceGroup,
      label: 'Naam',
      sortable: true,
      render: (value: string, row: ServiceGroup) => (
        <div className="font-medium">
          {value}
          {row.thumbnailUrl && (
            <div className="text-xs text-gray-500 mt-1">Het prentjie</div>
          )}
        </div>
      ),
    },
    {
      key: 'contactPerson' as keyof ServiceGroup,
      label: 'Kontak Persoon',
      sortable: true,
    },
    {
      key: 'contactEmail' as keyof ServiceGroup,
      label: 'E-pos',
      sortable: true,
      render: (value: string) => (
        <a 
          href={`mailto:${value}`}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {value}
        </a>
      ),
    },
    {
      key: '_count' as keyof ServiceGroup,
      label: 'Indienings',
      render: (value: any) => (
        <Badge variant="secondary">
          {value.contactSubmissions}
        </Badge>
      ),
    },
    {
      key: 'isActive' as keyof ServiceGroup,
      label: 'Status',
      render: (value: boolean) => (
        <StatusBadge status={value ? 'Aktief' : 'Onaktief'} />
      ),
    },
    {
      key: 'actions' as keyof ServiceGroup,
      label: 'Aksies',
    },
  ]

  const actions = [
    {
      label: 'Bekyk',
      onClick: handleView,
    },
    {
      label: 'Redigeer',
      onClick: handleEdit,
    },
    {
      label: (serviceGroup: ServiceGroup) => serviceGroup.isActive ? 'Deaktiveer' : 'Aktiveer',
      onClick: handleToggleStatus,
    },
    {
      label: 'Verwyder',
      onClick: (serviceGroup: ServiceGroup) => {
        showDeleteConfirmationToast(serviceGroup.name, () => handleDelete(serviceGroup))
      },
      variant: 'destructive' as const,
    },
  ]

  return (
    <div className="space-y-6">
      <DataTable
        title="Diensgroepe"
        description="Bestuur kerkdiensgroepe en bedienings"
        data={serviceGroups}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder="Soek diensgroepe..."
        onAdd={() => router.push('/admin/diensgroepe/new')}
        addButtonText="Voeg Diensgroep By"
        isLoading={loading}
        emptyStateText="Geen diensgroepe gevind nie."
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: (page) => fetchServiceGroups(page),
        }}
      />

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedServiceGroup?.name}
            </DialogTitle>
            <DialogDescription>
              Diensgroep besonderhede
            </DialogDescription>
          </DialogHeader>

          {selectedServiceGroup && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Beskrywing</h4>
                  <p className="text-gray-600 text-sm">
                    {selectedServiceGroup.description}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Kontak Persoon:</span>
                    <span className="text-sm text-gray-600">
                      {selectedServiceGroup.contactPerson}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">E-pos:</span>
                    <a 
                      href={`mailto:${selectedServiceGroup.contactEmail}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedServiceGroup.contactEmail}
                    </a>
                  </div>
                  
                  {selectedServiceGroup.contactPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">Telefoon:</span>
                      <a 
                        href={`tel:${selectedServiceGroup.contactPhone}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedServiceGroup.contactPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <StatusBadge status={selectedServiceGroup.isActive ? 'Aktief' : 'Onaktief'} />
                  <Badge variant="outline">
                    {selectedServiceGroup._count.contactSubmissions} Indienings
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-500">
                  Geskep: {new Date(selectedServiceGroup.createdAt).toLocaleDateString('af-ZA')}
                </div>
              </div>

              {selectedServiceGroup.thumbnailUrl && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Prentjie</h4>
                  <img
                    src={selectedServiceGroup.thumbnailUrl}
                    alt={selectedServiceGroup.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Maak Toe
            </Button>
            {selectedServiceGroup && (
              <Button onClick={() => handleEdit(selectedServiceGroup)}>
                <Edit className="mr-2 h-4 w-4" />
                Redigeer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
