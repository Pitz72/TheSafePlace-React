/** @type {import('tailwindcss').Config} */

// Colors are RGB triplets defined per theme in src/index.css.
const tone = name => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        cond: ['"Barlow Condensed"', 'Barlow', 'sans-serif'],
        serif: ['Literata', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        bg0: tone('bg0'),
        bg1: tone('bg1'),
        bg2: tone('bg2'),
        bg3: tone('bg3'),
        ink: tone('ink'),
        ink2: tone('ink2'),
        ink3: tone('ink3'),
        ink4: tone('ink4'),
        ember: tone('ember'),
        ember2: tone('ember2'),
        danger: tone('danger'),
        gold: tone('gold'),
        sage: tone('sage'),
        teal: tone('teal'),
        violet: tone('violet'),
        lena: tone('lena'),
        elian: tone('elian'),
        accent: 'rgb(var(--accent) / <alpha-value>)',
        line: 'var(--line)',
        line2: 'var(--line-2)',
        line3: 'var(--line-3)',
      },
    },
  },
  plugins: [],
}
