/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          950: '#431407',
        },
        gray: {
          850: '#1e2330',
        },
      },
    },
  },
  plugins: [],
}
