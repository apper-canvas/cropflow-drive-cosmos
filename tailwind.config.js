/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#228B22',
          light: '#32CD32',
          dark: '#006400'
        },
        secondary: {
          DEFAULT: '#8B4513',
          light: '#CD853F',
          dark: '#654321'
        },
        accent: '#FFB347',
        earth: {
          50: '#FAF9F6',
          100: '#F5F3F0',
          200: '#E8E4E0',
          300: '#D3CFC9',
          400: '#A09B94',
          500: '#7A756E',
          600: '#5C5851',
          700: '#3E3B37',
          800: '#1A1917',
          900: '#0F0E0D'
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui'],
        heading: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'neu-light': '5px 5px 15px #d1d9e6, -5px -5px 15px #ffffff',
        'neu-dark': '5px 5px 15px rgba(0, 0, 0, 0.3), -5px -5px 15px rgba(255, 255, 255, 0.05)',
        'earth': '0 2px 4px rgba(139,69,19,0.1)',
        'earth-hover': '0 8px 16px rgba(139,69,19,0.15)'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem'
      }
    }
  },
  plugins: [],
  darkMode: 'class',
}