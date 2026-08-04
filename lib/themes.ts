export const THEME_STORAGE_KEY = 'annlin-theme'
export const DEFAULT_THEME = 'heritage'

export const themes = [
  { id: 'heritage', name: 'Annlin Erfenis' },
  { id: 'jacaranda', name: 'Jakaranda' },
  { id: 'olive', name: 'Olyftak' },
  { id: 'stained-glass', name: 'Glasvenster' },
  { id: 'highveld', name: 'Hoëveld' },
] as const

export type ThemeId = (typeof themes)[number]['id']

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return themes.some((theme) => theme.id === value)
}

export const themeInitializationScript = `
  try {
    var storedTheme = localStorage.getItem('${THEME_STORAGE_KEY}');
    var themes = ${JSON.stringify(themes.map((theme) => theme.id))};
    document.documentElement.dataset.theme = themes.indexOf(storedTheme) >= 0
      ? storedTheme
      : '${DEFAULT_THEME}';
  } catch (error) {
    document.documentElement.dataset.theme = '${DEFAULT_THEME}';
  }
`
