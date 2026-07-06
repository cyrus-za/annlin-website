'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SignInClientProps {
  callbackUrl: string
}

export function SignInClient({ callbackUrl }: SignInClientProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      })

      if (result.error) {
        setError(result.error.message || 'Aanmelding het misluk')
      } else {
        router.push(callbackUrl)
      }
    } catch (signInError) {
      setError("'n Onverwagte fout het voorgekom")
      console.error('Sign in error:', signInError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meld Aan</h1>
          <p className="text-gray-600">Toegang tot die Annlin Gemeente administrasie paneel</p>
        </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Wagwoord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Voer jou wagwoord in"
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Meld tans aan...' : 'Meld Aan'}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <Link href="/auth/reset-password" className="text-sm font-medium text-amber-600 hover:text-amber-500">
              Wagwoord vergeet?
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Het jy nie 'n rekening nie?{' '}
              <Link href="/auth/contact-admin" className="font-medium text-amber-600 hover:text-amber-500">
                Kontak 'n administrateur
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Terug na webwerf
          </Link>
        </div>
      </Card>
    </div>
  )
}
