/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2f6690',
        'secondary': '#3a7ca5',
        'highlight': '#FF6700',
        'bg': '#d9dcd6',
        'dark': '#16425b',
        'light': '#81c3d7'
      }
    },
  },
  plugins: [],
}