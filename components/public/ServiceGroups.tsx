'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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

interface ServiceGroupsProps {
  limit?: number
  showAll?: boolean
}

export function ServiceGroups({ limit = 6, showAll = false }: ServiceGroupsProps) {
  const [serviceGroups, setServiceGroups] = React.useState<ServiceGroup[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchServiceGroups = async () => {
      try {
        const params = new URLSearchParams({
          isActive: 'true',
          sortBy: 'name',
          sortOrder: 'asc',
          ...(limit && !showAll && { limit: limit.toString() }),
        })

        const response = await fetch(`/api/diensgroepe?${params}`)
        
        if (!response.ok) {
          throw new Error('Kon nie diensgroepe laai nie')
        }
        
        const data = await response.json()
        setServiceGroups(data.serviceGroups || [])
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Kon nie diensgroepe laai nie')
      } finally {
        setLoading(false)
      }
    }

    fetchServiceGroups()
  }, [limit, showAll])

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Diensgroepe</h2>
            <p className="mt-4 text-lg text-gray-600">
              Raak betrokke by ons verskillende bedienings
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(limit)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-lg h-64 border"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || serviceGroups.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Diensgroepe</h2>
            <p className="mt-4 text-lg text-gray-600">
              {error || 'Geen aktiewe diensgroepe beskikbaar nie.'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-amber-900">Diensgroepe</h2>
          <p className="mt-4 text-lg text-amber-800">
            Raak betrokke by ons verskillende bedienings en help maak 'n verskil
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                {group.thumbnailUrl && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={group.thumbnailUrl}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
                
                <CardHeader className={group.thumbnailUrl ? 'pb-4' : ''}>
                  <CardTitle className="text-xl text-amber-900 group-hover:text-amber-700 transition-colors">
                    {group.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2">
                    {group.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Kontak:</span>
                      <span className="ml-1">{group.contactPerson}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a 
                        href={`mailto:${group.contactEmail}`}
                        className="text-amber-700 hover:text-amber-900 transition-colors"
                      >
                        {group.contactEmail}
                      </a>
                    </div>
                    
                    {group.contactPhone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <a 
                          href={`tel:${group.contactPhone}`}
                          className="text-amber-700 hover:text-amber-900 transition-colors"
                        >
                          {group.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <Button asChild className="w-full group">
                      <Link href={`/kontak?diensgroep=${group.id}`}>
                        Skakel In
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {!showAll && serviceGroups.length >= limit && (
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/diensgroepe">
                Bekyk Alle Diensgroepe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

// Compact version for sidebar or smaller spaces
export function ServiceGroupsCompact() {
  const [serviceGroups, setServiceGroups] = React.useState<ServiceGroup[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchServiceGroups = async () => {
      try {
        const params = new URLSearchParams({
          isActive: 'true',
          limit: '4',
          sortBy: 'name',
          sortOrder: 'asc',
        })

        const response = await fetch(`/api/diensgroepe?${params}`)
        
        if (response.ok) {
          const data = await response.json()
          setServiceGroups(data.serviceGroups || [])
        }
      } catch (error) {
        console.error('Error fetching service groups:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceGroups()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Diensgroepe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (serviceGroups.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Diensgroepe</CardTitle>
        <CardDescription>
          Raak betrokke by ons bedienings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {serviceGroups.map((group) => (
            <div key={group.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {group.name}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {group.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    {group.contactPerson}
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/kontak?diensgroep=${group.id}`}>
                    Kontak
                  </Link>
                </Button>
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/diensgroepe">
                Bekyk Alles →
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
