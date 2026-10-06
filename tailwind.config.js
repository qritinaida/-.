/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          bg: '#FAF8F5',
          cream: '#FEFCE8',
          yellow: '#FEF08A',
          amber: '#FDE68A',
          mint: '#DCFCE7',
          green: '#BBF7D0',
          peach: '#FFEDD5',
          coral: '#FED7AA',
          pink: '#FCE7F3',
          rose: '#FFE4E6',
          lavender: '#EDE9FE',
          sky: '#E0F2FE',
          slate: '#F8FAFC'
        },
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        cf: {
          orange: '#f38020',
          dark: '#1e1e1e'
        }
      }
    },
  },
  plugins: [],
}
