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
        // Category Colors (New)
        category: {
          shopping: '#0051D5',      // Blue
          entertainment: '#8B5CF6', // Purple
          food: '#F97316',          // Orange
          travel: '#06B6D4',        // Cyan
          gaming: '#EC4899',        // Pink
          lifestyle: '#10B981',     // Green
        },
        // Accent Colors (New)
        accent: {
          purple: {
            DEFAULT: '#8B5CF6',
            light: '#A78BFA',
            dark: '#7C3AED',
          },
          pink: {
            DEFAULT: '#EC4899',
            light: '#F472B6',
            dark: '#DB2777',
          },
          orange: {
            DEFAULT: '#F97316',
            light: '#FB923C',
            dark: '#EA580C',
          },
          cyan: {
            DEFAULT: '#06B6D4',
            light: '#22D3EE',
            dark: '#0891B2',
          },
        },
        // State Colors (New)
        state: {
          hover: 'rgba(0, 81, 213, 0.08)',
          pressed: 'rgba(0, 81, 213, 0.12)',
          focus: 'rgba(0, 81, 213, 0.12)',
          'focus-ring': '#0051D5',
        },
      },
      fontFamily: {
        'archivo': ['var(--font-archivo)', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'playfair': ['var(--font-playfair)', 'serif'],
      },
      fontSize: {
        // Hero (New - Bespoke Sizes)
        'hero': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '900' }],
        'hero-sub': ['clamp(1.25rem, 3vw, 2rem)', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        // Display (Enhanced)
        'display-xl': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        // Headline (Enhanced)
        'headline-xl': ['clamp(1.75rem, 4vw, 3rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
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
      backgroundImage: {
        // Gradient Presets (New)
        'gradient-purple': 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
        'gradient-pink': 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
        'gradient-orange': 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
        'gradient-blue': 'linear-gradient(135deg, #0051D5 0%, #0066FF 100%)',
        // Mesh Gradient (New)
        'mesh-purple': 'radial-gradient(at 27% 37%, hsla(270, 73%, 66%, 1) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(244, 73%, 66%, 1) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(280, 73%, 66%, 1) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 73%, 66%, 1) 0px, transparent 50%), radial-gradient(at 97% 96%, hsla(268, 73%, 66%, 1) 0px, transparent 50%), radial-gradient(at 33% 50%, hsla(252, 73%, 66%, 1) 0px, transparent 50%), radial-gradient(at 79% 53%, hsla(274, 73%, 66%, 1) 0px, transparent 50%)',
        // Shimmer Effect (New)
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      },
      keyframes: {
        // Fade Animations (New)
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Shimmer Animation (New)
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // Bounce Animation (New)
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        // Slide Animations (New)
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        // Animation Utilities (New)
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
