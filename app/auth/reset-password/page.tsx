import { ResetPasswordClient } from '@/components/auth/ResetPasswordClient'

export const dynamic = 'force-dynamic'

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; error?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token, error } = await searchParams
  return <ResetPasswordClient token={token ?? null} invalidToken={Boolean(error)} />
}
