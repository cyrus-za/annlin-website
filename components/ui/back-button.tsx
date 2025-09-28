'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  children: React.ReactNode
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export function BackButton({ 
  children, 
  className, 
  size = 'lg',
  variant = 'outline'
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back()
    } else {
      // If no history, go to home page
      router.push('/')
    }
  }

  return (
    <Button 
      onClick={handleBack}
      variant={variant}
      size={size}
      className={className}
    >
      <ArrowLeft className="mr-2 h-5 w-5" />
      {children}
    </Button>
  )
}
