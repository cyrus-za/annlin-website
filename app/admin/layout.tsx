import { requireAuth } from '@/lib/auth-config'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'
import type { UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = await requireAuth()
  const notificationCount = user.role === 'ADMIN'
    ? await prisma.contactSubmission.count({ where: { status: 'NEW' } })
    : 0

  return (
    <AdminLayoutClient 
      user={{
        name: user.name,
        email: user.email,
        role: user.role as UserRole
      }}
      notificationCount={notificationCount}
    >
      {children}
    </AdminLayoutClient>
  )
}
