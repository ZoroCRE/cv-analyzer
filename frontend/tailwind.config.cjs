/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B63D6',
          dark: '#084B9A',
        },
        secondary: {
          DEFAULT: '#00C2A8',
        },
        accent: {
          DEFAULT: '#FFD166',
        },
        'dark-bg': '#1a1a2e',
        'dark-surface': '#162447',
        'dark-text': '#e0e0e0',
        'dark-subtle': '#90a4d4',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif', 'Cairo'],
        body: ['Inter', 'sans-serif', 'Cairo'],
      },
      zIndex: {
        '10': '10', // Header
        '20': '20', // Dropdowns
        '30': '30', // Modals
        '40': '40', // Toasts
      },
    },
  },
  plugins: [],
}