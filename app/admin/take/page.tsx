import { FeatureRequestBoard } from '@/components/admin/FeatureRequestBoard'
import { requireAdmin } from '@/lib/auth-config'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  await requireAdmin()
  return <FeatureRequestBoard />
}
