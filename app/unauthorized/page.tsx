import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4 p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Toegang Geweier
          </h1>
          <p className="text-gray-600">
            Jy het nie toestemming om hierdie bladsy te benader nie. Kontak asseblief 'n administrateur as jy glo dit is 'n fout.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/">
              Gaan na Tuisblad
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/auth/sign-in">
              Meld Aan met Ander Rekening
            </Link>
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            As jy toegang tot administratiewe funksies benodig, kontak asseblief jou kerk administrateur.
          </p>
        </div>
      </Card>
    </div>
  )
}
