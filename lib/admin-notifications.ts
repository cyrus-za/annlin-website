export type AdminNotificationKind = 'CONTACT' | 'TASK' | 'CHANGELOG'

export type AdminNotification = {
  id: string
  kind: AdminNotificationKind
  title: string
  description: string
  href: string
  createdAt: string
}

export const ADMIN_NOTIFICATION_STORAGE_PREFIX = 'annlin-admin-notifications-v1'
