import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth-config'
import { MemberAuthorizationError } from '@/lib/members/authorization'
import { listWardManagement } from '@/lib/members/wards'
import { WardManagement } from '@/components/admin/members/WardManagement'

export const dynamic = 'force-dynamic'

export default async function WardsPage() {
  const { user } = await requireAuth()
  let result
  try {
    result = await listWardManagement(user.id)
  } catch (error) {
    if (error instanceof MemberAuthorizationError) notFound()
    throw error
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <div className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">Proeflopie</div>
        <h1 className="text-3xl font-bold text-gray-900">Wyke</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-gray-600">Bestuur die gemeente se wyke en hul ouderlinge. ’n Lidmaat se eie wyk en die wyk wat hy as ouderling bedien, word doelbewus apart gehou.</p>
      </header>
      <WardManagement
        canCreate={result.canCreate}
        wards={result.wards.map((ward) => ({ ...ward, activeFrom: ward.activeFrom.toISOString().slice(0, 10), elder: ward.elder ? { ...ward.elder, since: ward.elder.since.toISOString().slice(0, 10) } : null }))}
        candidates={result.candidates}
      />
    </div>
  )
}
