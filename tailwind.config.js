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
          
          // Inverse colors
          'inverse-surface': '#322F35',
          'inverse-on-surface': '#F5EFF7',
          'inverse-primary': '#D0BCFF',
        }
      },
      borderRadius: {
        // Material 3 shape scale
        'm3-none': '0px',
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '28px',
        'm3-full': '9999px',
      },
      boxShadow: {
        // Material 3 elevation levels
        'm3-1': '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'm3-2': '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'm3-3': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
        'm3-4': '0 2px 3px 0 rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15)',
        'm3-5': '0 4px 4px 0 rgba(0, 0, 0, 0.3), 0 8px 12px 6px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
