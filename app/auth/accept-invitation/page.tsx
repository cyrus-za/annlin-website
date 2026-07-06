import { AcceptInvitationClient } from '@/components/auth/AcceptInvitationClient'

export const dynamic = 'force-dynamic'

interface AcceptInvitationPageProps {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function AcceptInvitationPage({ searchParams }: AcceptInvitationPageProps) {
  const { token } = await searchParams

  return <AcceptInvitationClient token={token ?? null} />
}
