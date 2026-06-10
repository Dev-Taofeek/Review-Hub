import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs':  '360px',
      'sm':  '640px',
      'md':  '768px',
      'lg':  '1024px',
      'xl':  '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        trust: {
          background: 'var(--background)',
          foreground: 'var(--foreground)',
          surface: 'var(--surface)',
          soft: 'var(--surface-soft)',
          primary: 'var(--primary)',
          secondary: 'var(--secondary)',
          accent: 'var(--accent)',
          border: 'var(--border)',
          muted: 'var(--muted)',
          danger: 'var(--danger)',
        },
        /* ── Brand / Signal ──────────────────────────── */
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
        /* ── Signal (vivid electric emerald for dark UI) */
        signal: {
          DEFAULT: '#00E5A0',
          dim:     'rgba(0,229,160,0.12)',
          glow:    'rgba(0,229,160,0.35)',
        },
        /* ── Void surfaces ───────────────────────────── */
        void: {
          900: '#04060E',
          800: '#080A14',
          700: '#06251D',
          600: '#12162B',
          500: '#181D35',
          400: '#1E2440',
        },
        /* ── Legacy surface for compat ─────────────── */
        surface: {
          DEFAULT:       '#ffffff',
          muted:         '#f9fafb',
          subtle:        '#f3f4f6',
          dark:          '#080d1a',
          'dark-muted':  '#0d1526',
          'dark-subtle': '#083528',
        },
        /* ── Accent palette ──────────────────────────── */
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          950: '#1E0B4B',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
        crimson: {
          400: '#FF6B6B',
          500: '#EF4444',
          600: '#DC2626',
        },
      },

      fontFamily: {
        sans:  ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        display: ['var(--font-sora)', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        /* Precision shadows */
        'card':       '0 1px 0 rgba(255,255,255,0.04) inset, 0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)',
        'card-hover': '0 1px 0 rgba(255,255,255,0.07) inset, 0 2px 8px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.35)',
        'modal':      '0 0 0 1px rgba(255,255,255,0.06) inset, 0 32px 80px rgba(0,0,0,0.7)',
        'dropdown':   '0 0 0 1px rgba(255,255,255,0.05) inset, 0 16px 48px rgba(0,0,0,0.55)',

        /* Signal glow */
        'signal-sm': '0 0 12px rgba(0,229,160,0.25)',
        'signal-md': '0 0 28px rgba(0,229,160,0.35)',
        'signal-lg': '0 0 56px rgba(0,229,160,0.45)',
        'signal-ring': '0 0 0 1px rgba(0,229,160,0.3), 0 0 24px rgba(0,229,160,0.15)',

        /* Brand compat */
        'brand-sm': '0 2px 8px rgba(5,150,105,0.3)',
        'brand-md': '0 4px 20px rgba(5,150,105,0.35)',
        'brand-lg': '0 8px 32px rgba(5,150,105,0.4)',

        /* Accent glows */
        'violet-sm': '0 0 12px rgba(139,92,246,0.25)',
        'amber-sm':  '0 0 12px rgba(245,158,11,0.25)',

        /* Light mode card */
        'card-light': '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
        'card-light-hover': '0 4px 16px rgba(0,0,0,0.12), 0 16px 40px rgba(0,0,0,0.08)',

        /* Misc */
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.06)',
      },

      animation: {
        'fade-in':      'fadeIn 0.25s ease-out',
        'fade-up':      'fadeUp 0.35s ease-out',
        'slide-down':   'slideDown 0.22s ease-out',
        'scale-in':     'scaleIn 0.18s ease-out',
        'shimmer':      'shimmer 1.8s infinite linear',
        'pulse-soft':   'pulseSoft 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':        'float 4s ease-in-out infinite',
        'signal-pulse': 'signalPulse 2s ease-in-out infinite',
        'spin-slow':    'spin 6s linear infinite',
        'counter-up':   'counterUp 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      },

      keyframes: {
        fadeIn:       { from:{ opacity:'0' }, to:{ opacity:'1' } },
        fadeUp:       { from:{ opacity:'0', transform:'translateY(16px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideDown:    { from:{ opacity:'0', transform:'translateY(-10px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        scaleIn:      { from:{ opacity:'0', transform:'scale(0.93)' }, to:{ opacity:'1', transform:'scale(1)' } },
        shimmer:      { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
        pulseSoft:    { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'0.45' } },
        float:        { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
        signalPulse:  { '0%,100%':{ boxShadow:'0 0 8px rgba(0,229,160,0.2)' }, '50%':{ boxShadow:'0 0 28px rgba(0,229,160,0.55)' } },
        counterUp:    { from:{ opacity:'0', transform:'translateY(8px) scale(0.9)' }, to:{ opacity:'1', transform:'translateY(0) scale(1)' } },
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },

      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      letterSpacing: {
        'display': '-0.04em',
        'tight':   '-0.025em',
        'mono':    '0.12em',
        'label':   '0.18em',
      },

      lineHeight: {
        'display': '0.88',
        'tight':   '1.1',
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
