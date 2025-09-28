'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

interface InvitationData {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'EDITOR'
  inviterName: string
  expiresAt: string
}

export default function AcceptInvitationPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true)
  const [error, setError] = useState('')
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // Load invitation details
  useEffect(() => {
    if (!token) {
      setError('Ongeldige uitnodiging skakel')
      setIsLoadingInvitation(false)
      return
    }

    const loadInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${token}`)
        
        if (response.ok) {
          const data = await response.json()
          setInvitation(data)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Uitnodiging nie gevind nie')
        }
      } catch (error) {
        setError('Kon nie uitnodiging laai nie')
        console.error('Load invitation error:', error)
      } finally {
        setIsLoadingInvitation(false)
      }
    }

    loadInvitation()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords
    if (password.length < 8) {
      setError('Wagwoord moet ten minste 8 karakters lank wees')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Wagwoorde stem nie ooreen nie')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password 
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        // Redirect to sign in after a short delay
        setTimeout(() => {
          router.push('/auth/sign-in?message=account-created')
        }, 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Kon nie rekening skep nie')
      }
    } catch (error) {
      setError('ʼn Onverwagte fout het voorgekom')
      console.error('Accept invitation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Laai uitnodiging...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Rekening Geskep!</CardTitle>
            <CardDescription>
              Jou rekening is suksesvol geskep. Jy sal nou na die aanmelding bladsy geneem word.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                <p className="text-sm text-green-800">
                  Welkom by Annlin Gemeente CMS! Jy kan nou aanmeld met jou e-pos en wagwoord.
                </p>
              </div>
              <Button asChild>
                <Link href="/auth/sign-in">
                  Gaan na Aanmelding
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state (invalid/expired invitation)
  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Ongeldige Uitnodiging</CardTitle>
            <CardDescription>
              Hierdie uitnodiging skakel is ongeldig of het verval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Kontak ʼn administrateur vir ʼn nuwe uitnodiging
                </p>
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

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Aanvaar Uitnodiging</CardTitle>
          <CardDescription>
            Skep jou rekening om toegang te kry tot die Annlin Gemeente CMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitation && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="text-sm text-blue-800">
                <p><strong>Naam:</strong> {invitation.name}</p>
                <p><strong>E-pos:</strong> {invitation.email}</p>
                <p><strong>Rol:</strong> {invitation.role === 'ADMIN' ? 'Administrateur' : 'Redigeerder'}</p>
                <p><strong>Uitgenooi deur:</strong> {invitation.inviterName}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Wagwoord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Skep ʼn veilige wagwoord"
                required
                disabled={isLoading}
                minLength={8}
              />
              <p className="text-xs text-gray-500">
                Wagwoord moet ten minste 8 karakters lank wees
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bevestig Wagwoord</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Tik jou wagwoord weer"
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? 'Skep Rekening...' : 'Skep My Rekening'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
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
