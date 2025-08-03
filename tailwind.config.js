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
          // Colori principali
          primary: '#4EA162',      // Verde principale fosfori
          dim: '#336940',          // Verde scuro testo secondario
          bright: '#79ED95',       // Verde chiaro accenti
          highlight: '#7FC892',    // Verde highlight
          
          // Colori di sfondo
          bg: '#000000',           // Sfondo nero
          panel: '#111111',        // Sfondo pannelli
          overlay: 'rgba(8, 17, 11, 0.95)', // Overlay verde scuro
          
          // Colori bordi
          border: '#4EA162',       // Bordo principale
          'border-dim': '#22462A', // Bordo secondario
          
          // Colori stato
          danger: '#FF4444',       // Rosso pericolo
          warning: '#FFAA00',      // Arancione avviso
          
          // Colori mappa (derivati dal verde)
          plains: '#60BF77',       // Pianura
          forest: '#336940',       // Foresta
          mountain: '#52705A',     // Montagna
          water: '#008888',        // Acqua (ciano)
          ruin: '#5F996E',         // Rovine
          special: '#AAAA00',      // Speciale (giallo)
          
          // Colore per testo notturno
          'night-blue': '#00BFFF', // Blu acceso per la notte
        }
      },
      fontFamily: {
        'mono': ['Courier New', 'Courier', 'monospace'],
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
