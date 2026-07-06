import { SignInClient } from '@/components/auth/SignInClient'

export const dynamic = 'force-dynamic'

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string
  }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams

  return <SignInClient callbackUrl={callbackUrl ?? '/admin'} />
}
