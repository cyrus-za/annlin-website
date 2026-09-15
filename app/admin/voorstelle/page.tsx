import { FeatureRequestBoard } from '@/components/admin/FeatureRequestBoard'
import { requireAdmin } from '@/lib/auth-config'

export const dynamic = 'force-dynamic'

export default async function FeatureRequestsPage() {
  await requireAdmin()
  return <FeatureRequestBoard />
}
