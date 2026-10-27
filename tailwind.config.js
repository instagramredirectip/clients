/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F5EBD7',
          light: '#FAF4E8',
          dark: '#EADBBE',
          border: 'rgba(4, 100, 56, 0.16)',
        },
        emerald: {
          DEFAULT: '#046438',
          dark: '#034a29',
          light: '#087a46',
          muted: '#436852',
          border: 'rgba(4, 100, 56, 0.22)',
        },
        atelier: {
          dark: '#0c0c0e',
          surface: '#151518',
          card: '#1a1a1e',
          border: 'rgba(255, 255, 255, 0.08)',
          muted: '#8e8e93',
          gold: '#c5a880',
          chrome: '#e5e5ea',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
