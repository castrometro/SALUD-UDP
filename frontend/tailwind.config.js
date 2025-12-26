/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'arizona': ['ABC Arizona Flare', 'sans-serif'],
        'worksans': ['Work Sans', 'sans-serif'],
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
      },
      colors: {
        aqua: '#21b9fb',
        beige: '#f8f6f3',
      },
    },
  },
  plugins: [],
}
