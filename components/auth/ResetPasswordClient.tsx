'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, KeyRound, Mail } from 'lucide-react'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ResetPasswordClientProps {
  token: string | null
  invalidToken: boolean
}

type SuccessState = 'email' | 'password' | null

export function ResetPasswordClient({ token, invalidToken }: ResetPasswordClientProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(
    invalidToken ? "Hierdie herstelskakel is ongeldig of het verval. Versoek asseblief 'n nuwe een." : '',
  )
  const [success, setSuccess] = useState<SuccessState>(null)

  const requestReset = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (result.error) {
        setError('Kon nie die herstelskakel stuur nie. Probeer asseblief later weer.')
      } else {
        setSuccess('email')
      }
    } catch (resetError) {
      setError("'n Onverwagte fout het voorgekom. Probeer asseblief later weer.")
      console.error('Password reset request error:', resetError)
    } finally {
      setIsLoading(false)
    }
  }

  const setNewPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!token) {
      setError("Hierdie herstelskakel is ongeldig. Versoek asseblief 'n nuwe een.")
      return
    }

    if (password.length < 8) {
      setError('Die nuwe wagwoord moet minstens 8 karakters lank wees.')
      return
    }

    if (password !== confirmPassword) {
      setError('Die twee wagwoorde stem nie ooreen nie.')
      return
    }

    setIsLoading(true)
    try {
      const result = await authClient.resetPassword({ newPassword: password, token })

      if (result.error) {
        setError("Die herstelskakel is ongeldig of het verval. Versoek asseblief 'n nuwe een.")
      } else {
        setSuccess('password')
      }
    } catch (resetError) {
      setError("'n Onverwagte fout het voorgekom. Probeer asseblief later weer.")
      console.error('Password reset error:', resetError)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <ResetShell
        icon={<CheckCircle className="h-6 w-6" />}
        title={success === 'email' ? 'Kontroleer jou e-pos' : 'Wagwoord verander'}
        description={
          success === 'email'
            ? "Indien die adres aan 'n rekening gekoppel is, sal jy binnekort 'n herstelskakel ontvang."
            : 'Jou nuwe wagwoord is gestel. Meld nou weer aan.'
        }
      >
        {success === 'email' ? (
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(null)
              setEmail('')
            }}
            className="w-full"
          >
            Probeer weer
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link href="/auth/sign-in">Meld aan</Link>
          </Button>
        )}
        <BackToSignIn />
      </ResetShell>
    )
  }

  if (token) {
    return (
      <ResetShell
        icon={<KeyRound className="h-6 w-6" />}
        title="Kies 'n nuwe wagwoord"
        description="Gebruik minstens 8 karakters en kies 'n wagwoord wat jy nie elders gebruik nie."
      >
        <form onSubmit={setNewPassword} className="space-y-5">
          {error ? <ErrorMessage message={error} /> : null}
          <div className="space-y-2">
            <Label htmlFor="new-password">Nuwe wagwoord</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Bevestig nuwe wagwoord</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Wagwoord word verander...' : 'Stel nuwe wagwoord'}
          </Button>
        </form>
        <BackToSignIn />
      </ResetShell>
    )
  }

  return (
    <ResetShell
      icon={<Mail className="h-6 w-6" />}
      title="Wagwoord vergeet?"
      description="Voer jou bestuurder-e-posadres in. Ons stuur 'n skakel waarmee jy 'n nuwe wagwoord kan kies."
    >
      <form onSubmit={requestReset} className="space-y-5">
        {error ? <ErrorMessage message={error} /> : null}
        <div className="space-y-2">
          <Label htmlFor="email">E-posadres</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading || !email}>
          {isLoading ? 'Herstelskakel word gestuur...' : 'Stuur herstelskakel'}
        </Button>
      </form>
      <BackToSignIn />
    </ResetShell>
  )
}

function ResetShell({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-stone-900 text-white">
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">{children}</CardContent>
      </Card>
    </main>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      {message}
    </div>
  )
}

function BackToSignIn() {
  return (
    <Button asChild variant="ghost" className="w-full">
      <Link href="/auth/sign-in">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Terug na aanmelding
      </Link>
    </Button>
  )
}
