/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0F172A',
          card: '#1E293B',
          cardGlass: 'rgba(30, 41, 59, 0.75)',
          border: 'rgba(56, 189, 248, 0.2)',
          primary: '#2563EB',
          primaryHover: '#1D4ED8',
          secondary: '#38BDF8',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          muted: '#94A3B8',
          glow: 'rgba(37, 99, 235, 0.35)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'cyber-glow': '0 0 25px -5px rgba(37, 99, 235, 0.4)',
        'cyan-glow': '0 0 25px -5px rgba(56, 189, 248, 0.4)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
