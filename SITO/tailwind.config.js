/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 0.8 },
        },
        textFlicker: {
          '0%': { opacity: 0.8 },
          '2%': { opacity: 1 },
          '8%': { opacity: 0.8 },
          '9%': { opacity: 1 },
          '12%': { opacity: 0.8 },
          '20%': { opacity: 1 },
          '25%': { opacity: 0.9 },
          '30%': { opacity: 1 },
          '70%': { opacity: 1 },
          '72%': { opacity: 0.8 },
          '77%': { opacity: 1 },
          '100%': { opacity: 1 },
        },
        blink: {
          '50%': { opacity: 0 },
        },
        fadeIn: {
          'from': { opacity: 0 },
          'to': { opacity: 1 },
        }
      },
      animation: {
        flicker: 'flicker 0.15s infinite',
        'text-flicker': 'textFlicker 3s linear infinite',
        blink: 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 1s ease-in forwards',
      },
    },
  },
  plugins: [],
}