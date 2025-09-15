/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // === COLOR SYSTEM COMPLETO ===
      colors: {
        // Tema fosfori verdi anni '80 - COMPLETO
        phosphor: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
          300: '#86efac', 400: '#4ade80', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 800: '#166534',
          900: '#14532d', 950: '#052e16',
          bright: '#4ade80', accent: '#0099ff',
          'night-blue': '#00BFFF', water: '#008888',
        },
        
        // Background system
        'game-bg': {
          primary: '#000000', soft: '#0A0A0A', panel: '#111111',
          'panel-bright': '#1A1A1A', 'panel-dark': '#0D0D0D',
        },
        
        // Journal message colors  
        journal: {
          welcome: '#FFD700', standard: '#22c55e', river: '#008888',
          warning: '#FFA500', success: '#00FF7F', failure: '#FF4444',
          'hp-recovery': '#32CD32', 'hp-damage': '#DC143C',
          rest: '#87CEEB', item: '#FFD700', discovery: '#FF69B4',
        },
        
        // Item type colors
        item: {
          weapon: '#FF4444', armor: '#4169E1', consumable: '#00FF7F',
          quest: '#FFD700', crafting: '#DA70D6', rare: '#1E90FF',
        },
      },
      
      // === TYPOGRAPHY SYSTEM ===
      fontFamily: {
        'ibm-pc': ['IBM Plex Mono', 'monospace'],
      },
      
      // === ANIMATION SYSTEM ===
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'crt-warmup': 'crt-warmup 3s ease-out',
        'crt-flicker': 'crt-flicker 4s ease-in-out infinite',
        'phosphor-pulse': 'phosphor-pulse 3s ease-in-out infinite',
      },
      
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px #4EA162, 0 0 10px #4EA162' },
          '100%': { textShadow: '0 0 10px #79ED95, 0 0 20px #79ED95' },
        },
        'crt-warmup': {
          '0%': { opacity: '0.1', filter: 'brightness(0.2)' },
          '100%': { opacity: '1', filter: 'brightness(1)' },
        },
        'phosphor-pulse': {
          '0%': { textShadow: '0 0 3px #4EA162' },
          '50%': { textShadow: '0 0 6px #79ED95, 0 0 12px #79ED95' },
          '100%': { textShadow: '0 0 3px #4EA162' },
        }
      },
      
      // === BOX SHADOW SYSTEM ===
      boxShadow: {
        'phosphor': '0 0 10px rgba(34, 197, 94, 0.5)',
        'phosphor-intense': '0 0 20px rgba(34, 197, 94, 0.8)',
        'crt-screen': '0 0 20px rgba(78, 161, 98, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
      },
    }
  },
  
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        // === CRT EFFECTS ===
        '.crt-phosphor-glow': {
          textShadow: '0 0 5px #22c55e, 0 0 10px #22c55e',
        },
        '.crt-screen-effect': {
          background: 'radial-gradient(ellipse at center, #0A0A0A 0%, #000000 70%)',
          boxShadow: '0 0 20px rgba(78, 161, 98, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
        },
        
        // === UTILITY CLASSES ===
        '.no-scrollbar': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }
      }
      addUtilities(newUtilities)
    }
  ],
}