'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { signIn } from '@/lib/auth-client'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl
      })

      if (result.error) {
        setError(result.error.message || 'Aanmelding het misluk')
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      setError('\u2019n Onverwagte fout het voorgekom')
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Meld Aan
          </h1>
          <p className="text-gray-600">
            Toegang tot die Annlin Gemeente administrasie paneel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Wagwoord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Voer jou wagwoord in"
              required
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Meld tans aan...' : 'Meld Aan'}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <Link 
              href="/auth/reset-password" 
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Wagwoord vergeet?
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Het jy nie \u2019n rekening nie?{' '}
              <Link 
                href="/auth/contact-admin" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Kontak \u2019n administrateur
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Terug na webwerf
          </Link>
        </div>
      </Card>
    </div>
  )
}
