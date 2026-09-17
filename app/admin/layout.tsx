import { requireAuth } from '@/lib/auth-config'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'
import type { UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'
import { listTasks } from '@/lib/services/tasks'
import type { AdminNotification } from '@/lib/admin-notifications'
import { requireMemberCapability } from '@/lib/members/authorization'

export const dynamic = 'force-dynamic'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = await requireAuth()
  const actor = { id: user.id, role: user.role as UserRole }
  const [contacts, taskPage, changes, memberAccess, wardManagement] = await Promise.all([
    user.role === 'ADMIN'
      ? prisma.contactSubmission.findMany({ where: { status: 'NEW' }, select: { id: true, subject: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 100 })
      : Promise.resolve([]),
    listTasks(actor, { scope: 'unread', limit: 100 }),
    prisma.changelogEntry.findMany({ select: { id: true, title: true, category: true, publishedAt: true }, orderBy: { publishedAt: 'desc' }, take: 100 }),
    requireMemberCapability(user.id, 'MEMBER_READ').then(() => true).catch(() => false),
    requireMemberCapability(user.id, 'WARD_WRITE').then(() => true).catch(() => false),
  ])
  const notifications: AdminNotification[] = [
    ...contacts.map((contact) => ({
      id: `contact:${contact.id}`,
      kind: 'CONTACT' as const,
      title: contact.subject,
      description: 'Nuwe kontaknavraag',
      href: `/admin/indienings/${contact.id}`,
      createdAt: contact.createdAt.toISOString(),
    })),
    ...taskPage.requests.map((task) => ({
      id: `task:${task.id}:${task.lastActivityAt}`,
      kind: 'TASK' as const,
      title: task.title,
      description: task.assignee?.id === user.id ? 'Aan jou toegewys' : 'Nuwe taakaktiwiteit',
      href: `/admin/take?taak=${task.id}`,
      createdAt: task.lastActivityAt,
    })),
    ...changes.map((change) => ({
      id: `changelog:${change.id}`,
      kind: 'CHANGELOG' as const,
      title: change.title,
      description: change.category,
      href: '/admin/veranderingslogboek',
      createdAt: change.publishedAt.toISOString(),
    })),
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt))

  return (
    <AdminLayoutClient 
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole
      }}
      notifications={notifications}
      showMemberPilot={memberAccess}
      showWardManagement={wardManagement}
    >
      {children}
    </AdminLayoutClient>
  )
}
