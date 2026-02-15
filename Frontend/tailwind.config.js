/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
          },
        dark: {
          50: '#f9fafb',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
