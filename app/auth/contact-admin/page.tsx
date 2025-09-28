'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle, Phone, MessageSquare } from 'lucide-react'

export default function ContactAdminPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/contact/admin-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          type: 'ADMIN_ACCESS'
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Kon nie boodskap stuur nie')
      }
    } catch (error) {
      setError('ʼn Onverwagte fout het voorgekom')
      console.error('Contact admin error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Boodskap Gestuur</CardTitle>
            <CardDescription>
              Jou versoek is gestuur na die administrateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-800">
                  Dankie vir jou versoek! ʼn Administrateur sal jou binnekort kontak om toegang te bespreek.
                  Jy sal ʼn e-pos uitnodiging ontvang as jou versoek goedgekeur word.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <Button asChild>
                  <Link href="/auth/sign-in">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Terug na Aanmelding
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-lg w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle>Versoek Toegang</CardTitle>
          <CardDescription>
            Kontak ʼn administrateur om toegang tot die CMS te verkry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Volledige Naam</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Voer jou naam in"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-pos Adres</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Voer jou e-pos in"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Hierdie sal jou gebruikernaam wees as toegang verleen word
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Rede vir Toegang</Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Verduidelik waarom jy toegang tot die CMS benodig..."
                required
                disabled={isLoading}
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-gray-500">
                Beskryf jou rol in die gemeente en waarom jy CMS toegang benodig
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !name || !email || !message}
            >
              {isLoading ? 'Stuur Versoek...' : 'Stuur Versoek'}
            </Button>
          </form>

          {/* Alternative contact methods */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Alternatiewe Kontak Metodes</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>admin@annlin-gemeente.co.za</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>012 345 6789</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Jy kan ook direk kontak maak as jy dringende toegang benodig
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/sign-in"
              className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Terug na Aanmelding
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Terug na webwerf
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
