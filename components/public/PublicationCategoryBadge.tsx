import {
  BookOpenText,
  CalendarRange,
  FileText,
  Globe2,
  Headphones,
  MessageSquareText,
  Newspaper,
  ScrollText,
  Shapes,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const presentations = {
  'Die Fontein - Weekblad': {
    icon: Newspaper,
    badge: 'border-sky-300 bg-sky-50 text-sky-900',
    accent: 'border-t-sky-500',
  },
  'Die Fontein - Maandblad': {
    icon: BookOpenText,
    badge: 'border-rose-300 bg-rose-50 text-rose-900',
    accent: 'border-t-rose-500',
  },
  Liturgie: {
    icon: ScrollText,
    badge: 'border-amber-300 bg-amber-50 text-amber-950',
    accent: 'border-t-amber-500',
  },
  Preeksamevattings: {
    icon: MessageSquareText,
    badge: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    accent: 'border-t-emerald-500',
  },
  Kinderwerk: {
    icon: Shapes,
    badge: 'border-orange-300 bg-orange-50 text-orange-900',
    accent: 'border-t-orange-500',
  },
  Oordenkings: {
    icon: Headphones,
    badge: 'border-teal-300 bg-teal-50 text-teal-900',
    accent: 'border-t-teal-500',
  },
  Jaarprogramme: {
    icon: CalendarRange,
    badge: 'border-blue-300 bg-blue-50 text-blue-900',
    accent: 'border-t-blue-500',
  },
  Uitreikmateriaal: {
    icon: Globe2,
    badge: 'border-lime-300 bg-lime-50 text-lime-950',
    accent: 'border-t-lime-500',
  },
} as const

const fallbackPresentation = {
  icon: FileText,
  badge: 'border-stone-300 bg-stone-50 text-stone-800',
  accent: 'border-t-stone-400',
}

export function publicationCategoryPresentation(category: string) {
  return presentations[category as keyof typeof presentations] || fallbackPresentation
}

export function PublicationCategoryBadge({ category }: { category: string }) {
  const presentation = publicationCategoryPresentation(category)
  const Icon = presentation.icon

  return (
    <Badge variant="outline" className={cn('gap-1.5 rounded-full', presentation.badge)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {category}
    </Badge>
  )
}
