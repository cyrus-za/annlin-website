import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth-config'
import { MemberAuthorizationError } from '@/lib/members/authorization'
import { MEMBER_STATUS_LABELS } from '@/lib/members/labels'
import { listMembers } from '@/lib/members/queries'
import { memberDetailHref, memberRowId } from '@/lib/members/register-links'

export const dynamic = 'force-dynamic'

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ soek?: string; bladsy?: string }>
}) {
  const { user } = await requireAuth()
  const params = await searchParams
  let result
  try {
    result = await listMembers(user.id, {
      search: params.soek,
      page: Number(params.bladsy || 1),
    })
  } catch (error) {
    if (error instanceof MemberAuthorizationError) notFound()
    throw error
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">Proeflopie</div>
          <h1 className="text-3xl font-bold text-gray-900">Lidmaatregister</h1>
          <p className="mt-1 text-base text-gray-600">Sintetiese proefdata. Winkerk bly tans die amptelike register.</p>
        </div>
        <span className="text-sm text-gray-600">{result.total} rekord{result.total === 1 ? '' : 's'}</span>
      </header>

      <form className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm" method="get">
        <label htmlFor="member-search" className="mb-2 block text-sm font-semibold text-gray-800">Soek volgens naam of van</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="member-search" name="soek" defaultValue={params.soek} className="h-11 flex-1 rounded-md border border-gray-300 px-3 text-base" />
          <button className="h-11 rounded-md bg-amber-800 px-5 font-semibold text-white hover:bg-amber-900">Soek</button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {result.members.length === 0 ? (
          <div className="p-8 text-center text-gray-600">Geen lidmate pas by hierdie soektog nie.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {result.members.map((member) => {
              const household = member.householdHistory[0]?.household
              const ward = member.wardAssignments[0]?.ward
              return (
                <article
                  key={member.id}
                  id={memberRowId(member.id)}
                  className="relative grid scroll-mt-4 gap-2 p-4 transition-colors hover:bg-amber-50/60 focus-within:ring-2 focus-within:ring-inset focus-within:ring-amber-500 target:bg-amber-50 sm:grid-cols-[minmax(0,1fr)_12rem_10rem] sm:items-center"
                >
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-gray-900">
                      {/* The stretched link makes the whole row clickable with a single tab stop. */}
                      <Link
                        href={memberDetailHref(member.id, params)}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                      >
                        {member.preferredName || member.firstNames} {member.lastName}
                      </Link>
                    </h2>
                    <p className="text-sm text-gray-600">{household?.name || 'Geen huidige huishouding'}</p>
                  </div>
                  <p className="text-sm text-gray-700">{ward ? `${ward.code}: ${ward.name}` : 'Geen individuele wyk'}</p>
                  <span className="w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{MEMBER_STATUS_LABELS[member.status]}</span>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {result.totalPages > 1 && (
        <nav aria-label="Lidmaatregister bladsye" className="flex justify-between text-sm font-semibold">
          {result.page > 1 ? <Link href={`?soek=${encodeURIComponent(params.soek || '')}&bladsy=${result.page - 1}`}>Vorige</Link> : <span />}
          <span>Bladsy {result.page} van {result.totalPages}</span>
          {result.page < result.totalPages ? <Link href={`?soek=${encodeURIComponent(params.soek || '')}&bladsy=${result.page + 1}`}>Volgende</Link> : <span />}
        </nav>
      )}
    </div>
  )
}
