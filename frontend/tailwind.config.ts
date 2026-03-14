import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Color System ────────────────────────────────────────────────
      colors: {
        genome: {
          // Base surfaces
          dark:           '#0A0A0F',
          'dark-2':       '#0D0D14',
          card:           '#12121A',
          'card-hover':   '#161622',
          border:         '#1E1E2E',
          'border-2':     '#252538',

          // Brand accent
          accent:         '#6C63FF',
          'accent-hover': '#5A52E0',
          'accent-dim':   '#6C63FF33',
          'accent-subtle':'#6C63FF1A',

          // Semantic colors
          gold:        '#F0C040',
          'gold-dim':  '#F0C04033',
          green:       '#00D48A',
          'green-dim': '#00D48A33',
          red:         '#FF4D6A',
          'red-dim':   '#FF4D6A33',
          blue:        '#4DA6FF',
          'blue-dim':  '#4DA6FF33',
          purple:      '#C084FC',
          'purple-dim':'#C084FC33',

          // Typography
          text:     '#E8E8F0',
          'text-2': '#C8C8D8',
          muted:    '#6B6B80',
          'muted-2':'#4A4A5E',

          // Data visualization palette
          'data-1': '#6C63FF',
          'data-2': '#00D48A',
          'data-3': '#F0C040',
          'data-4': '#FF4D6A',
          'data-5': '#4DA6FF',
          'data-6': '#C084FC',
        },
      },

      // ─── Typography ──────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs:    ['0.75rem',  { lineHeight: '1rem' }],
        sm:    ['0.875rem', { lineHeight: '1.25rem' }],
        base:  ['1rem',     { lineHeight: '1.5rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl': ['3rem',     { lineHeight: '1.16' }],
        '6xl': ['3.75rem',  { lineHeight: '1.1' }],
        '7xl': ['4.5rem',   { lineHeight: '1.05' }],
      },
      letterSpacing: {
        tightest: '-0.05em',
        tighter:  '-0.025em',
        tight:    '-0.01em',
        normal:   '0',
        wide:     '0.025em',
        wider:    '0.05em',
        widest:   '0.1em',
        data:     '0.08em',
      },

      // ─── Spacing ─────────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
        '30':  '7.5rem',
        '88':  '22rem',
        '104': '26rem',
        '112': '28rem',
        '120': '30rem',
        '128': '32rem',
      },

      // ─── Border Radius ────────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
      },

      // ─── Shadow System ────────────────────────────────────────────────
      boxShadow: {
        'glow':       '0 0 20px rgba(108,99,255,0.35)',
        'glow-sm':    '0 0 10px rgba(108,99,255,0.25)',
        'glow-lg':    '0 0 40px rgba(108,99,255,0.4)',
        'glow-gold':  '0 0 20px rgba(240,192,64,0.35)',
        'glow-green': '0 0 20px rgba(0,212,138,0.35)',
        'glow-red':   '0 0 20px rgba(255,77,106,0.35)',
        'card':       '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(108,99,255,0.1)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(108,99,255,0.2)',
      },

      // ─── Z-Index Scale ────────────────────────────────────────────────
      zIndex: {
        'dropdown': '100',
        'sticky':   '200',
        'overlay':  '300',
        'modal':    '400',
        'popover':  '500',
        'toast':    '600',
        'tooltip':  '700',
      },

      // ─── Easing Functions ─────────────────────────────────────────────
      transitionTimingFunction: {
        'spring':     'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'bounce':     'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
        'accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
      },

      // ─── Keyframes ───────────────────────────────────────────────────
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(108,99,255,0.2)' },
          '50%':      { boxShadow: '0 0 30px rgba(108,99,255,0.5)' },
        },
        'slide-in-bottom': {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'slide-in-top': {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bounce-in': {
          '0%':   { transform: 'scale(0.3)', opacity: '0' },
          '50%':  { transform: 'scale(1.05)' },
          '70%':  { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
      },

      // ─── Animations ───────────────────────────────────────────────────
      animation: {
        'pulse-slow':      'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':           'float 6s ease-in-out infinite',
        'scan':            'scan 2s linear infinite',
        'shimmer':         'shimmer 2s linear infinite',
        'fade-in':         'fade-in 0.3s ease-out forwards',
        'fade-in-up':      'fade-in-up 0.4s cubic-bezier(0,0,0.2,1) forwards',
        'fade-in-down':    'fade-in-down 0.4s cubic-bezier(0,0,0.2,1) forwards',
        'fade-in-left':    'fade-in-left 0.4s cubic-bezier(0,0,0.2,1) forwards',
        'fade-in-right':   'fade-in-right 0.4s cubic-bezier(0,0,0.2,1) forwards',
        'scale-in':        'scale-in 0.3s cubic-bezier(0,0,0.2,1) forwards',
        'glow-pulse':      'glow-pulse 2s ease-in-out infinite',
        'slide-in-bottom': 'slide-in-bottom 0.4s cubic-bezier(0,0,0.2,1) forwards',
        'slide-in-top':    'slide-in-top 0.4s cubic-bezier(0,0,0.2,1) forwards',
        'spin-slow':       'spin-slow 8s linear infinite',
        'bounce-in':       'bounce-in 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
      },

      // ─── Backdrop Blur ────────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ─── Max Width ────────────────────────────────────────────────────
      maxWidth: {
        content: '900px',
        wide:    '1200px',
      },
    },
  },
  plugins: [],
}

export default config
