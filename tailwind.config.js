/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{components,data,hooks,src,store,types,utils}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}