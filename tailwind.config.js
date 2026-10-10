
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#DC2626',      
          redHover: '#B91C1C', 
          redMuted: 'rgba(220, 38, 38, 0.12)',
          dark: '#0A0A0A',     
          darker: '#050505',
          card: '#111113',     
          cardHover: '#161619',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.18)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Space Grotesk', 'sans-serif'],
        grotesk: ['Plus Jakarta Sans', 'Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
