import { requireAuth } from '@/lib/auth-config'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = await requireAuth()

  return (
    <AdminLayoutClient 
      user={{
        name: user.name,
        email: user.email,
        role: user.role
      }}
    >
      {children}
    </AdminLayoutClient>
  )
}
