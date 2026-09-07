import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        void: {
          DEFAULT: '#050507',
          50: '#0a0a0f',
          100: '#0d0d13',
          200: '#111118',
        },
        cyan: {
          glow: '#5eead4',
        },
        violet: {
          glow: '#a78bfa',
        },
        signal: {
          cyan: '#33e1e6',
          violet: '#8b5cf6',
          magenta: '#f472b6',
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        'aurora': 'radial-gradient(circle at 20% 20%, rgba(51,225,230,0.15), transparent 40%), radial-gradient(circle at 80% 0%, rgba(139,92,246,0.15), transparent 40%), radial-gradient(circle at 50% 100%, rgba(244,114,182,0.08), transparent 50%)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'caret-blink': { '0%,70%,100%': { opacity: '1' }, '20%,50%': { opacity: '0' } },
        'scan': { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        'glow-pulse': { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        'marquee': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'caret-blink': 'caret-blink 1.1s ease-out infinite',
        'scan': 'scan 3s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
