'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ResetPasswordClientProps {
  token: string | null
  invalidToken: boolean
}

export function ResetPasswordClient({ token, invalidToken }: ResetPasswordClientProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, redirectTo: '/auth/reset-password' }),
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Kon nie wagwoord herstel nie')
      }
    } catch (resetError) {
      setError("ʼn Onverwagte fout het voorgekom")
      console.error('Password reset error:', resetError)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Wagwoord moet ten minste 8 karakters lank wees')
      return
    }

    if (password !== confirmPassword) {
      setError('Wagwoorde stem nie ooreen nie')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        setError('Die herstelskakel is ongeldig of het verval')
      }
    } catch (resetError) {
      setError("ʼn Onverwagte fout het voorgekom")
      console.error('Password change error:', resetError)
    } finally {
      setIsLoading(false)
    }
  }

  if (invalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <CardTitle>Ongeldige Herstelskakel</CardTitle>
          <CardDescription className="mt-3">Die skakel is ongeldig of het verval. Versoek asseblief ʼn nuwe een.</CardDescription>
          <Button asChild className="mt-6"><Link href="/auth/reset-password">Versoek Nuwe Skakel</Link></Button>
        </Card>
      </div>
    )
  }

  if (token && !isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle>Kies ʼn Nuwe Wagwoord</CardTitle>
            <CardDescription>Gebruik ten minste 8 karakters.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              {error && <div className="rounded-md border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-600">{error}</p></div>}
              <div className="space-y-2">
                <Label htmlFor="password">Nuwe Wagwoord</Label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig Wagwoord</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required disabled={isLoading} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Herstel tans...' : 'Herstel Wagwoord'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>{token ? 'Wagwoord Herstel' : 'E-pos Gestuur'}</CardTitle>
            <CardDescription>{token ? 'Jou wagwoord is verander. Meld nou weer aan.' : 'Kontroleer jou e-pos vir instruksies om jou wagwoord te herstel'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  {token ? 'Alle bestaande sessies is vir veiligheid beëindig.' : <>Ons het ʼn wagwoord-herstel skakel gestuur na <strong>{email}</strong>.</>}
                </p>
              </div>

              {!token && <div className="space-y-4 text-center">
                <p className="text-sm text-gray-600">Het jy nie die e-pos ontvang nie?</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                  className="w-full"
                >
                  Probeer Weer
                </Button>
              </div>}

              <div className="border-t border-gray-200 pt-4">
                <Link href="/auth/sign-in">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Terug na Aanmelding
                  </Button>
                </Link>
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
            <Mail className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle>Herstel Wagwoord</CardTitle>
          <CardDescription>
            Voer jou e-pos adres in en ons sal jou ʼn skakel stuur om jou wagwoord te herstel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-pos Adres</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Voer jou e-pos in"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">Voer die e-pos adres in wat jy gebruik het om jou rekening te skep</p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? 'Stuur tans...' : 'Stuur Herstel Skakel'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/sign-in" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Terug na Aanmelding
            </Link>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Terug na webwerf
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
