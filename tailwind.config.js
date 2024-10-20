/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        secondary: '#F0F4F8',
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
      animation: {
        'fade-in-out': 'fadeInOut 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInOut: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}