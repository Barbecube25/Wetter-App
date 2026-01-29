/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 Color System
        'm3': {
          // Primary colors
          'primary': '#6750A4',
          'on-primary': '#FFFFFF',
          'primary-container': '#EADDFF',
          'on-primary-container': '#21005D',
          
          // Secondary colors
          'secondary': '#625B71',
          'on-secondary': '#FFFFFF',
          'secondary-container': '#E8DEF8',
          'on-secondary-container': '#1D192B',
          
          // Tertiary colors
          'tertiary': '#7D5260',
          'on-tertiary': '#FFFFFF',
          'tertiary-container': '#FFD8E4',
          'on-tertiary-container': '#31111D',
          
          // Error colors
          'error': '#B3261E',
          'on-error': '#FFFFFF',
          'error-container': '#F9DEDC',
          'on-error-container': '#410E0B',
          
          // Surface colors
          'surface': '#FEF7FF',
          'on-surface': '#1D1B20',
          'surface-variant': '#E7E0EC',
          'on-surface-variant': '#49454F',
          'surface-container-lowest': '#FFFFFF',
          'surface-container-low': '#F7F2FA',
          'surface-container': '#F3EDF7',
          'surface-container-high': '#ECE6F0',
          'surface-container-highest': '#E6E0E9',
          
          // Outline colors
          'outline': '#79747E',
          'outline-variant': '#CAC4D0',
          
          // Inverse colors - Optimized for dark mode readability
          'inverse-surface': '#2d2d2d',
          'inverse-on-surface': '#F5EFF7',
          'inverse-primary': '#D0BCFF',
          
          // Dark mode specific surface colors
          'dark-surface': '#2d2d2d',
          'dark-surface-container': '#3a3a3a',
          'dark-surface-container-high': '#454545',
          'dark-surface-container-highest': '#505050',
          'dark-on-surface': '#E6E1E5',
          'dark-on-surface-variant': '#CAC4D0',
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
        // Material 3 type scale
        'm3-display-large': ['57px', { lineHeight: '64px', fontWeight: '400' }],
        'm3-display-medium': ['45px', { lineHeight: '52px', fontWeight: '400' }],
        'm3-display-small': ['36px', { lineHeight: '44px', fontWeight: '400' }],
        'm3-headline-large': ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'm3-headline-medium': ['28px', { lineHeight: '36px', fontWeight: '400' }],
        'm3-headline-small': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'm3-title-large': ['22px', { lineHeight: '28px', fontWeight: '500' }],
        'm3-title-medium': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'm3-title-small': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'm3-body-large': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'm3-body-medium': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'm3-body-small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'm3-label-large': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'm3-label-medium': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'm3-label-small': ['11px', { lineHeight: '16px', fontWeight: '500' }],
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
