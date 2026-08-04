const themedScale = (name) => ({
  50: `hsl(var(--${name}-50) / <alpha-value>)`,
  100: `hsl(var(--${name}-100) / <alpha-value>)`,
  200: `hsl(var(--${name}-200) / <alpha-value>)`,
  300: `hsl(var(--${name}-300) / <alpha-value>)`,
  400: `hsl(var(--${name}-400) / <alpha-value>)`,
  500: `hsl(var(--${name}-500) / <alpha-value>)`,
  600: `hsl(var(--${name}-600) / <alpha-value>)`,
  700: `hsl(var(--${name}-700) / <alpha-value>)`,
  800: `hsl(var(--${name}-800) / <alpha-value>)`,
  900: `hsl(var(--${name}-900) / <alpha-value>)`,
  950: `hsl(var(--${name}-950) / <alpha-value>)`,
})

const themedColor = (name) => `hsl(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      colors: {
        white: themedColor('color-white'),
        black: themedColor('color-black'),
        amber: themedScale('amber'),
        gray: themedScale('gray'),
        stone: themedScale('stone'),
        red: themedScale('red'),
        green: themedScale('green'),
        yellow: themedScale('yellow'),
        blue: themedScale('blue'),
        orange: themedScale('orange'),
        border: themedColor('border'),
        input: themedColor('input'),
        ring: themedColor('ring'),
        background: themedColor('background'),
        foreground: themedColor('foreground'),
        primary: {
          DEFAULT: themedColor('primary'),
          foreground: themedColor('primary-foreground'),
        },
        secondary: {
          DEFAULT: themedColor('secondary'),
          foreground: themedColor('secondary-foreground'),
        },
        destructive: {
          DEFAULT: themedColor('destructive'),
          foreground: themedColor('destructive-foreground'),
        },
        muted: {
          DEFAULT: themedColor('muted'),
          foreground: themedColor('muted-foreground'),
        },
        accent: {
          DEFAULT: themedColor('accent'),
          foreground: themedColor('accent-foreground'),
        },
        popover: {
          DEFAULT: themedColor('popover'),
          foreground: themedColor('popover-foreground'),
        },
        card: {
          DEFAULT: themedColor('card'),
          foreground: themedColor('card-foreground'),
        },
        'church-brown': themedColor('church-brown'),
        'church-tan': themedColor('church-tan'),
        'church-cream': themedColor('church-cream'),
        'church-gold': themedColor('church-gold'),
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
