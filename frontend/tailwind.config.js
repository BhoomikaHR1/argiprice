/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AgriPrice Brand Palette — Karnataka Fields
        forest: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#1B4332',  // Primary brand green
          950: '#052e16',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#D4A017',  // Harvest gold
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        cream: '#F9F5F0',
        charcoal: '#2D3748',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Kannada', 'system-ui', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'price': ['2.25rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'price-lg': ['3rem', { lineHeight: '1', fontWeight: '800', letterSpacing: '-0.03em' }],
      },
      backgroundImage: {
        'field-gradient': 'linear-gradient(135deg, #1B4332 0%, #2d6a4f 50%, #40916c 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4A017 0%, #f4c842 100%)',
        'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #F9F5F0 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(27, 67, 50, 0.08), 0 4px 16px rgba(27, 67, 50, 0.06)',
        'card-hover': '0 4px 12px rgba(27, 67, 50, 0.12), 0 12px 32px rgba(27, 67, 50, 0.1)',
        'price': '0 0 0 3px rgba(212, 160, 23, 0.2)',
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 160, 23, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212, 160, 23, 0)' },
        },
      },
    },
  },
  plugins: [],
}
