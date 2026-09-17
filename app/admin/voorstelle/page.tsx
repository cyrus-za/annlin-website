import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProposalsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ voorstel?: string }>
}) {
  const { voorstel } = await searchParams
  redirect(voorstel ? `/admin/take?taak=${encodeURIComponent(voorstel)}` : '/admin/take')
}
