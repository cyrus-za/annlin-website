'use client'

import * as React from 'react'
import { Palette } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_THEME,
  isThemeId,
  THEME_STORAGE_KEY,
  themes,
  type ThemeId,
} from '@/lib/themes'
import { cn } from '@/lib/utils'

const THEME_CHANGE_EVENT = 'annlin-theme-change'

function ThemeSwatch({ themeId }: { themeId: ThemeId }) {
  return (
    <span
      className={cn('flex -space-x-1 theme-swatch', `theme-swatch--${themeId}`)}
      aria-hidden="true"
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="theme-swatch__color h-4 w-4 rounded-full border border-white shadow-sm"
        />
      ))}
    </span>
  )
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<ThemeId>(DEFAULT_THEME)

  React.useEffect(() => {
    const syncTheme = () => {
      const activeTheme = document.documentElement.dataset['theme']
      setTheme(isThemeId(activeTheme) ? activeTheme : DEFAULT_THEME)
    }

    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !isThemeId(event.newValue)) return

      document.documentElement.dataset['theme'] = event.newValue
      setTheme(event.newValue)
    }

    syncTheme()
    window.addEventListener(THEME_CHANGE_EVENT, syncTheme)
    window.addEventListener('storage', syncStoredTheme)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, syncTheme)
      window.removeEventListener('storage', syncStoredTheme)
    }
  }, [])

  const selectTheme = (value: string) => {
    if (!isThemeId(value)) return

    const root = document.documentElement
    root.classList.add('theme-transition')
    root.dataset['theme'] = value
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, value)
    } catch {
      // The active tab can still use the theme when storage is unavailable.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
    window.setTimeout(() => root.classList.remove('theme-transition'), 220)
  }

  const activeTheme = themes.find((option) => option.id === theme) ?? themes[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-11 gap-2 px-2 text-gray-600 hover:text-amber-700', className)}
          aria-label={`Kleurtema: ${activeTheme.name}`}
          title={`Kleurtema: ${activeTheme.name}`}
        >
          <Palette className="h-5 w-5" />
          <span className="hidden 2xl:inline">Tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-amber-700" />
          Kies ’n kleurtema
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={selectTheme}>
          {themes.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              value={option.id}
              className="min-h-11 cursor-pointer gap-3 pr-3"
            >
              <ThemeSwatch themeId={option.id} />
              <span className="flex-1">{option.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
