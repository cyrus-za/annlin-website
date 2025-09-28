'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Column<T> {
  key: keyof T | 'actions'
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

interface Action<T> {
  label: string
  onClick: (row: T) => void
  variant?: 'default' | 'destructive'
}

interface DataTableProps<T> {
  title: string
  description?: string
  data: T[]
  columns: Column<T>[]
  actions?: Action<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  onAdd?: () => void
  addButtonText?: string
  isLoading?: boolean
  emptyStateText?: string
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}

export function DataTable<T extends Record<string, any>>({
  title,
  description,
  data,
  columns,
  actions = [],
  searchable = true,
  searchPlaceholder = 'Soek...',
  onAdd,
  addButtonText = 'Voeg By',
  isLoading = false,
  emptyStateText = 'Geen data gevind nie.',
  pagination
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data
    
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }, [data, searchQuery])

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? (
      <SortAsc className="ml-2 h-4 w-4" />
    ) : (
      <SortDesc className="ml-2 h-4 w-4" />
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Laai data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and filters */}
        {searchable && (
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Data table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={String(column.key)}
                    className={column.sortable ? 'cursor-pointer select-none hover:bg-gray-50' : ''}
                    onClick={() => column.sortable && column.key !== 'actions' && handleSort(column.key as keyof T)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && column.key !== 'actions' && getSortIcon(column.key as keyof T)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium mb-2">{emptyStateText}</p>
                      {searchQuery && (
                        <p className="text-sm">
                          Probeer ʼn ander soekterm of{' '}
                          <button
                            onClick={() => setSearchQuery('')}
                            className="text-amber-600 hover:text-amber-500 underline"
                          >
                            verwyder filters
                          </button>
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.key === 'actions' ? (
                          actions.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksies</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {actions.map((action, actionIndex) => (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={() => action.onClick(row)}
                                    className={action.variant === 'destructive' ? 'text-red-600' : ''}
                                  >
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )
                        ) : column.render ? (
                          column.render(row[column.key], row)
                        ) : (
                          String(row[column.key] || '')
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Bladsy {pagination.currentPage} van {pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Vorige
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Volgende
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Results summary */}
        {sortedData.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            {searchQuery ? (
              <>
                {sortedData.length} resultate gevind vir "{searchQuery}"
                {sortedData.length !== data.length && (
                  <span> uit {data.length} totaal</span>
                )}
              </>
            ) : (
              `${sortedData.length} resultate`
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
