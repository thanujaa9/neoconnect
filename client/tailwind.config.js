/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-dark': '#4338ca',
        sidebar: '#1e293b',
        'sidebar-light': '#334155',
      }
    },
  },
  plugins: [],
}