'use client'

import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type AdminPreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
  actions?: ReactNode
}

export function AdminPreviewDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
}: AdminPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 pb-4 pr-12 pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-6 py-5">{children}</div>

        {actions ? (
          <DialogFooter className="border-t bg-stone-50 px-6 py-4">{actions}</DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
