'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePassword } from '@/lib/auth-client'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 8) {
      setError('Die nuwe wagwoord moet minstens 8 karakters wees.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Die nuwe wagwoorde stem nie ooreen nie.')
      return
    }

    setIsSaving(true)

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })

      if (result.error) {
        setError(result.error.message || 'Kon nie wagwoord verander nie.')
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Wagwoord suksesvol verander.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon nie wagwoord verander nie.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Verander wagwoord</CardTitle>
          <CardDescription>
            Gebruik hierdie skerm nadat 'n tydelike wagwoord aan jou gegee is.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="currentPassword">Huidige wagwoord</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">Nuwe wagwoord</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Bevestig nuwe wagwoord</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Stoor...' : 'Stoor nuwe wagwoord'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
