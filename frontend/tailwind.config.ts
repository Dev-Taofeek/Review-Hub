import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        surface: {
          DEFAULT:       '#ffffff',
          muted:         '#f9fafb',
          subtle:        '#f3f4f6',
          dark:          '#080d1a',
          'dark-muted':  '#0d1526',
          'dark-subtle': '#111c30',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand':    'linear-gradient(135deg, #059669 0%, #047857 100%)',
        'gradient-hero':     'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        'gradient-card':     'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.8) 100%)',
        'gradient-dark':     'linear-gradient(145deg, #111827 0%, #0b1120 100%)',
        'shimmer':           'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
      },
      boxShadow: {
        'xs':        '0 1px 2px rgba(0,0,0,0.05)',
        'soft':      '0 2px 8px rgba(0,0,0,0.06)',
        'card':      '0 1px 3px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.05)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)',
        'modal':     '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        'dropdown':  '0 4px 24px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.3)',
        'brand-sm':  '0 2px 8px rgba(5,150,105,0.3)',
        'brand-md':  '0 4px 20px rgba(5,150,105,0.35)',
        'brand-lg':  '0 8px 32px rgba(5,150,105,0.4)',
        'glow-green':'0 0 24px rgba(16,185,129,0.25)',
        'inner-sm':  'inset 0 1px 2px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'fade-up':    'fadeUp 0.3s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in':   'scaleIn 0.15s ease-out',
        'shimmer':    'shimmer 1.5s infinite linear',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':      'float 3s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(16,185,129,0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(16,185,129,0.6)' },
        },
      },
      spacing: {
        '18': '4.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
