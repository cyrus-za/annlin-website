const legacyThemeColors: Record<string, { solid: string; tint: string }> = {
  '#78350F': themeColor('amber-900'),
  '#92400E': themeColor('amber-800'),
  '#A16207': themeColor('amber-700'),
  '#D97706': themeColor('amber-600'),
  '#F59E0B': themeColor('amber-500'),
  '#FBBF24': themeColor('amber-400'),
  '#B45309': themeColor('amber-700'),
  '#EA580C': themeColor('amber-600'),
}

function themeColor(token: string) {
  return {
    solid: `hsl(var(--${token}))`,
    tint: `hsl(var(--${token}) / 0.12)`,
  }
}

function legacyThemeColor(color: string | undefined) {
  return color ? legacyThemeColors[color.toUpperCase()] : undefined
}

export function eventCategoryColor(color: string | undefined) {
  return legacyThemeColor(color)?.solid ?? color
}

export function eventCategoryTint(color: string) {
  return legacyThemeColor(color)?.tint ?? `color-mix(in srgb, ${color} 12%, transparent)`
}
