/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          ivory: '#F7F4EB',
          cream: '#EEEBDD',
          sage: '#A5B89B',
          'sage-light': '#C5D4BD',
          'sage-dark': '#869C7B',
          forest: '#244436',
          'forest-deep': '#1A3328',
          'forest-light': '#325C4B',
          olive: '#718468',
          'olive-light': '#8D9F84',
          'olive-dark': '#55664E',
          champagne: '#D8B989',
          'champagne-light': '#EFE2CE',
          'champagne-dark': '#C29F6A',
          charcoal: '#252D27',
          'charcoal-light': '#4A554D',
          'charcoal-muted': '#728075',
          white: '#FFFFFF',
        },
        agro: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Fraunces"', 'Georgia', 'serif'],
        display: ['"Fraunces"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Manrope"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'atelier': '2rem',
        'botanical': '2.5rem',
      },
      boxShadow: {
        'atelier': '0 20px 40px -15px rgba(36, 68, 54, 0.08), 0 0 1px 1px rgba(36, 68, 54, 0.05)',
        'atelier-hover': '0 30px 60px -20px rgba(36, 68, 54, 0.15), 0 0 1px 1px rgba(36, 68, 54, 0.08)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
      }
    },
  },
  plugins: [],
}

