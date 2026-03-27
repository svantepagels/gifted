import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Navy (Ink)
        primary: {
          DEFAULT: '#0F172A',
          container: '#131B2E',
          'on-container': '#7C839B',
        },
        // Secondary Blue (CTA)
        secondary: {
          DEFAULT: '#0051D5',
          hover: '#003BA3',
          'on-secondary': '#FFFFFF',
        },
        // Success Green
        tertiary: {
          'fixed-dim': '#62DF7D',
          container: '#009842',
          'on-container': '#FFFFFF',
        },
        // Error Red
        error: {
          DEFAULT: '#DC2626',
          container: '#FEE2E2',
          'on-container': '#991B1B',
        },
        // Surface Hierarchy
        surface: {
          DEFAULT: '#F7F9FB',
          bright: '#FAFBFC',
          container: {
            lowest: '#FFFFFF',
            low: '#F2F4F6',
            DEFAULT: '#ECEEF0',
            high: '#E6E8EA',
            highest: '#DFE1E4',
          },
          'on-surface': '#0F172A',
          'on-surface-variant': '#64748B',
        },
        // Outline
        outline: {
          variant: '#C6C6CD',
        },
      },
      fontFamily: {
        archivo: ['var(--font-archivo)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        // Display
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        // Headline
        'headline-lg': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'headline-md': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        'headline-sm': ['1.5rem', { lineHeight: '1.35', letterSpacing: '-0.02em' }],
        // Title
        'title-lg': ['1.375rem', { lineHeight: '1.4' }],
        'title-md': ['1rem', { lineHeight: '1.5' }],
        'title-sm': ['0.875rem', { lineHeight: '1.45' }],
        // Body
        'body-lg': ['1rem', { lineHeight: '1.6' }],
        'body-md': ['0.875rem', { lineHeight: '1.55' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5' }],
        // Label
        'label-lg': ['0.875rem', { lineHeight: '1.45', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1.45', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.05em' }],
      },
      borderRadius: {
        sm: '0.5rem',   // 8px
        md: '0.75rem',  // 12px
        lg: '1rem',     // 16px
        xl: '1.25rem',  // 20px
      },
      boxShadow: {
        ambient: '0px 12px 32px rgba(15, 23, 42, 0.06)',
        'ambient-lg': '0px 20px 48px rgba(15, 23, 42, 0.08)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      scale: {
        '98': '0.98',
      },
    },
  },
  plugins: [],
}

export default config
