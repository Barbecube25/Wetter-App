/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Material 3 Color System
        'm3': {
          // Primary colors
          'primary': '#005AC1',
          'on-primary': '#FFFFFF',
          'primary-container': '#D8E2FF',
          'on-primary-container': '#001A41',
          
          // Secondary colors
          'secondary': '#535F70',
          'on-secondary': '#FFFFFF',
          'secondary-container': '#D7E3F8',
          'on-secondary-container': '#101C2B',
          
          // Tertiary colors
          'tertiary': '#006877',
          'on-tertiary': '#FFFFFF',
          'tertiary-container': '#A6EEFF',
          'on-tertiary-container': '#001F26',
          
          // Error colors
          'error': '#B3261E',
          'on-error': '#FFFFFF',
          'error-container': '#F9DEDC',
          'on-error-container': '#410E0B',
          
          // Surface colors
          'surface': '#F9F9FF',
          'on-surface': '#1A1C1E',
          'surface-variant': '#DEE3EB',
          'on-surface-variant': '#42474E',
          'surface-container-lowest': '#FFFFFF',
          'surface-container-low': '#F3F4FA',
          'surface-container': '#ECEEF4',
          'surface-container-high': '#E6E8EE',
          'surface-container-highest': '#E0E2E8',
          
          // Outline colors
          'outline': '#72777F',
          'outline-variant': '#C2C7CF',
          
          // Inverse colors - Optimized for dark mode readability
          'inverse-surface': '#2F3033',
          'inverse-on-surface': '#F1F0F4',
          'inverse-primary': '#AAC7FF',
          
          // Dark mode specific surface colors
          'dark-surface': '#111418',
          'dark-surface-container': '#1D2024',
          'dark-surface-container-high': '#282B2F',
          'dark-surface-container-highest': '#33363A',
          'dark-on-surface': '#E2E2E6',
          'dark-on-surface-variant': '#C2C7CF',
          'dark-primary': '#AAC7FF',
          'dark-outline-variant': '#42474E',
        }
      },
      borderRadius: {
        // Material 3 shape scale - enhanced for modern look
        'm3-none': '0px',
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '20px',
        'm3-2xl': '24px',
        'm3-3xl': '28px',
        'm3-full': '9999px',
      },
      boxShadow: {
        // Material 3 elevation levels - enhanced
        'm3-0': 'none',
        'm3-1': '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'm3-2': '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'm3-3': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
        'm3-4': '0 2px 3px 0 rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15)',
        'm3-5': '0 4px 4px 0 rgba(0, 0, 0, 0.3), 0 8px 12px 6px rgba(0, 0, 0, 0.15)',
      },
      spacing: {
        // Material 3 spacing scale
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '16px',
        'm3-lg': '24px',
        'm3-xl': '32px',
        'm3-2xl': '48px',
      },
      fontSize: {
        // Default Tailwind type scale (slightly larger for better readability)
        'xs': ['0.875rem', { lineHeight: '1.25rem' }],
        'sm': ['0.9375rem', { lineHeight: '1.375rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // Material 3 type scale
        'm3-display-large': ['57px', { lineHeight: '64px', fontWeight: '400' }],
        'm3-display-medium': ['45px', { lineHeight: '52px', fontWeight: '400' }],
        'm3-display-small': ['36px', { lineHeight: '44px', fontWeight: '400' }],
        'm3-headline-large': ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'm3-headline-medium': ['28px', { lineHeight: '36px', fontWeight: '400' }],
        'm3-headline-small': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'm3-title-large': ['22px', { lineHeight: '28px', fontWeight: '500' }],
        'm3-title-medium': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'm3-title-small': ['16px', { lineHeight: '22px', fontWeight: '500' }],
        'm3-body-large': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'm3-body-medium': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'm3-body-small': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'm3-label-large': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'm3-label-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'm3-label-small': ['13px', { lineHeight: '18px', fontWeight: '500' }],
      },
      animation: {
        'm3-ripple': 'ripple 0.6s ease-out',
        'm3-fade-in': 'fadeIn 0.3s ease-out',
        'm3-slide-up': 'slideUp 0.3s ease-out',
        'm3-scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
