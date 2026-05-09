export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#FFF3ED',
          100: '#FFE4CC',
          200: '#FFCCA3',
          300: '#FFB07A',
          400: '#FF8C52',
          500: '#FF6B35',
          600: '#F05A28',
          700: '#C94516',
          800: '#A33610',
          900: '#7C2A0D',
        },
        cream: {
          50:  '#FFFBF5',
          100: '#FFF3E0',
          200: '#FFE0B2',
        },
        /* Semantic — used in success, warning, danger badges/states */
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
      },
      boxShadow: {
        /* Natural, layered shadows — not flat, not exaggerated */
        card:       '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':'0 6px 20px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        glow:       '0 0 0 3px rgba(255,107,53,0.18), 0 4px 16px rgba(255,107,53,0.28)',
        'glow-sm':  '0 0 0 2px rgba(255,107,53,0.14)',
        elevated:   '0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.07)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FF6B35 0%, #F05A28 55%, #C94516 100%)',
        'gradient-primary': 'linear-gradient(135deg, #FF6B35 0%, #F05A28 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in':        'fadeIn 0.35s ease-out',
        'slide-up':       'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)',
        'bounce-soft':    'bounceSoft 0.5s ease-out',
        'pulse-glow':     'pulseGlow 2.5s ease-in-out infinite',
        'scale-in':       'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:      { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        bounceSoft:   { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
        pulseGlow:    { '0%,100%': { boxShadow: '0 0 8px rgba(255,107,53,0.2)' }, '50%': { boxShadow: '0 0 22px rgba(255,107,53,0.5)' } },
        scaleIn:      { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
