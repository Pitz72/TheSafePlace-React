/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '80': '20rem',  // 320px
        '96': '24rem',  // 384px
      },
      colors: {
        // Tema fosfori verdi anni '80
        phosphor: {
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
          accent: '#0099ff'
        }
      },
      fontFamily: {
        'mono': ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'scan': 'scan 3s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'flicker': 'flicker 0.15s ease-in-out infinite alternate',
        'phosphor-pulse': 'phosphor-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px #4EA162, 0 0 10px #4EA162, 0 0 15px #4EA162' },
          '100%': { textShadow: '0 0 10px #79ED95, 0 0 20px #79ED95, 0 0 30px #79ED95' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        flicker: {
          '0%': { opacity: 1, textShadow: '0 0 5px #4EA162' },
          '100%': { opacity: 0.95, textShadow: '0 0 8px #79ED95' },
        },
        'phosphor-pulse': {
          '0%': { textShadow: '0 0 3px #4EA162, 0 0 6px #4EA162' },
          '50%': { textShadow: '0 0 6px #79ED95, 0 0 12px #79ED95, 0 0 18px #79ED95' },
          '100%': { textShadow: '0 0 3px #4EA162, 0 0 6px #4EA162' },
        }
      },
      textShadow: {
        'phosphor-glow': '0 0 5px #4EA162, 0 0 10px #4EA162',
        'phosphor-bright': '0 0 8px #79ED95, 0 0 16px #79ED95',
        'phosphor-intense': '0 0 10px #79ED95, 0 0 20px #79ED95, 0 0 30px #79ED95',
        'phosphor-dim': '0 0 3px #336940',
        'phosphor-danger': '0 0 5px #FF4444, 0 0 10px #FF4444',
        'phosphor-warning': '0 0 5px #FFAA00, 0 0 10px #FFAA00',
      }
    }
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.glow-phosphor': {
          textShadow: '0 0 5px #4EA162, 0 0 10px #4EA162',
        },
        '.glow-phosphor-bright': {
          textShadow: '0 0 8px #79ED95, 0 0 16px #79ED95',
        },
        '.glow-phosphor-intense': {
          textShadow: '0 0 10px #79ED95, 0 0 20px #79ED95, 0 0 30px #79ED95',
        },
        '.glow-phosphor-dim': {
          textShadow: '0 0 3px #336940',
        },
        '.glow-phosphor-danger': {
          textShadow: '0 0 5px #FF4444, 0 0 10px #FF4444',
        },
        '.glow-phosphor-warning': {
          textShadow: '0 0 5px #FFAA00, 0 0 10px #FFAA00',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
