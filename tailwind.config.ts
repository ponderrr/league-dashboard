import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-manrope)', 'sans-serif'],
      },
      colors: {
        background: '#0f172a', // slate-900
        'background-alt': '#1e293b', // slate-800
        foreground: 'rgba(249, 250, 251, 0.9)',
        border: 'rgba(255, 255, 255, 0.1)',
        // Accent colors from design system
        accent: {
          blue: '#2563eb',
          'blue-light': '#3b82f6',
          cyan: '#22d3ee',
          green: '#22c55e',
          'green-dark': '#16a34a',
          yellow: '#eab308',
          'yellow-dark': '#ca8a04',
          red: '#ef4444',
          'red-dark': '#dc2626',
          purple: '#a855f7',
          'purple-dark': '#9333ea',
        },
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
};

export default config;

