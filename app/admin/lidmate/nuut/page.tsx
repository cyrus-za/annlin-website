import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requireAuth } from '@/lib/auth-config'
import { MemberAuthorizationError } from '@/lib/members/authorization'
import { memberCreateStatusOptions } from '@/lib/members/create-form'
import { getMemberCreateOptions } from '@/lib/members/queries'
import { MemberCreateForm } from '@/components/admin/members/MemberCreateForm'

export const dynamic = 'force-dynamic'

export default async function NewMemberPage() {
  const { user } = await requireAuth()
  let options
  try {
    options = await getMemberCreateOptions(user.id)
  } catch (error) {
    if (error instanceof MemberAuthorizationError) notFound()
    throw error
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/admin/lidmate" className="inline-flex min-h-11 items-center gap-2 rounded-md text-base font-semibold text-amber-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Terug na register
      </Link>
      <header>
        <div className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">Proeflopie</div>
        <h1 className="text-3xl font-bold text-gray-900">Voeg ’n lidmaat by</h1>
        <p className="mt-1 text-base text-gray-600">Skep eers die kernrekord. Winkerk bly tans die amptelike register.</p>
      </header>
      <MemberCreateForm {...options} statusOptions={memberCreateStatusOptions()} />
    </div>
  )
}
