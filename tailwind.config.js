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
        atelier: {
          dark: '#0c0c0e',
          surface: '#151518',
          card: '#1a1a1e',
          border: 'rgba(255, 255, 255, 0.08)',
          muted: '#8e8e93',
          gold: '#c5a880',
          chrome: '#e5e5ea',
        },
        nord: {
          bg: '#f6f5f0',
          surface: '#ecebe4',
          card: '#ffffff',
          border: 'rgba(0, 0, 0, 0.08)',
          text: '#191919',
          muted: '#737373',
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

