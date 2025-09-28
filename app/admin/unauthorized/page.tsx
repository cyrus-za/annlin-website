import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AdminUnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4 p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
            <svg
              className="h-8 w-8 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Administrateur Toegang Vereis
          </h1>
          <p className="text-gray-600">
            Hierdie afdeling vereis administrateur voorregte. Jy is tans aangemeld as 'n Redigeerder.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/admin">
              Terug na Paneelbord
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/auth/sign-in">
              Meld Aan as Administrateur
            </Link>
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Administrateur funksies sluit in gebruiker bestuur, sisteem instellings, en uitnodiging bestuur.
          </p>
        </div>
      </Card>
    </div>
  )
}
