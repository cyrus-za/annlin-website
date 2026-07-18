'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, CheckCircle, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InvitationData {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'EDITOR'
  inviterName: string
  expiresAt: string
}

interface AcceptInvitationClientProps {
  token: string | null
}

function InvitationLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-amber-600" />
            <p className="text-gray-600">Laai uitnodiging...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AcceptInvitationClient({ token }: AcceptInvitationClientProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true)
  const [error, setError] = useState('')
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (!token) {
      setError('Ongeldige uitnodiging skakel')
      setIsLoadingInvitation(false)
      return
    }

    const loadInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/accept?token=${encodeURIComponent(token)}`)

        if (response.ok) {
          const data = await response.json()
          setInvitation(data.invitation)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Uitnodiging nie gevind nie')
        }
      } catch (loadError) {
        setError('Kon nie uitnodiging laai nie')
        console.error('Load invitation error:', loadError)
      } finally {
        setIsLoadingInvitation(false)
      }
    }

    loadInvitation()
  }, [token])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

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
          password,
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/auth/sign-in?message=account-created')
        }, 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Kon nie rekening skep nie')
      }
    } catch (submitError) {
      setError("ʼn Onverwagte fout het voorgekom")
      console.error('Accept invitation error:', submitError)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingInvitation) {
    return <InvitationLoadingState />
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Rekening Geskep!</CardTitle>
            <CardDescription>
              Jou rekening is suksesvol geskep. Jy sal nou na die aanmelding bladsy geneem word.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  Welkom by Annlin Gemeente CMS! Jy kan nou aanmeld met jou e-pos en wagwoord.
                </p>
              </div>
              <Button asChild>
                <Link href="/auth/sign-in">Gaan na Aanmelding</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Ongeldige Uitnodiging</CardTitle>
            <CardDescription>Hierdie uitnodiging skakel is ongeldig of het verval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>

              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-600">Kontak ʼn administrateur vir ʼn nuwe uitnodiging</p>
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
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <UserPlus className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle>Aanvaar Uitnodiging</CardTitle>
          <CardDescription>
            Skep jou rekening om toegang te kry tot die Annlin Gemeente CMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitation && (
            <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm text-amber-800">
                <p><strong>Naam:</strong> {invitation.name}</p>
                <p><strong>E-pos:</strong> {invitation.email}</p>
                <p><strong>Rol:</strong> {invitation.role === 'ADMIN' ? 'Administrateur' : 'Redigeerder'}</p>
                <p><strong>Uitgenooi deur:</strong> {invitation.inviterName}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Wagwoord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Skep ʼn veilige wagwoord"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">Ten minste 8 karakters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bevestig Wagwoord</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Herhaal jou wagwoord"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Skep Rekening...' : 'Skep Rekening'}
            </Button>

            <div className="text-center">
              <Button variant="ghost" asChild>
                <Link href="/auth/sign-in">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Terug na Aanmelding
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
