/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0a0a0a',
        panel: '#111111',
        border: '#1f1f1f',
        muted: '#3a3a3a',
        text: {
          primary: '#f5f5f5',
          secondary: '#a0a0a0',
          muted: '#555555',   // agora resolvido como text-text-muted
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
