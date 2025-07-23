/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
      colors: {
        'black-800': '#2c014a',
        'orange-400': '#ff00c3',
      },
    },
  },
  plugins: [],
}
