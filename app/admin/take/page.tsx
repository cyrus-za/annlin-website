import { TaskBoard } from '@/components/admin/TaskBoard'
import { requireAdmin } from '@/lib/auth-config'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  await requireAdmin()
  return <TaskBoard />
}
