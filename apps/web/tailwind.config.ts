import type { Config } from 'tailwindcss';

/**
 * Every value here resolves to a CSS custom property declared in src/styles/tokens.css.
 * Colours are stored as space-separated RGB channels so Tailwind's `<alpha-value>` slot works,
 * which is what lets `border-accent/40` and `bg-bg-base/80` behave.
 *
 * No raw hex belongs in JSX. If a colour is needed that is not here, add a token first.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',

  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },

    extend: {
      colors: {
        bg: {
          base: 'rgb(var(--bg-base) / <alpha-value>)',
          white: 'rgb(var(--bg-white) / <alpha-value>)',
          grey: 'rgb(var(--bg-grey) / <alpha-value>)',
          band: 'rgb(var(--bg-band) / <alpha-value>)',
          navy: 'rgb(var(--bg-navy) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          ink: 'rgb(var(--accent-ink) / <alpha-value>)',
          dim: 'rgb(var(--accent-dim) / <alpha-value>)',
          solid: 'rgb(var(--accent-solid) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          teal: 'rgb(var(--accent-teal) / <alpha-value>)',
          amber: 'rgb(var(--accent-amber) / <alpha-value>)',
        },
        ink: {
          primary: 'rgb(var(--ink-primary) / <alpha-value>)',
          body: 'rgb(var(--ink-body) / <alpha-value>)',
          'on-accent': 'rgb(var(--ink-on-accent) / <alpha-value>)',
          secondary: 'rgb(var(--ink-secondary) / <alpha-value>)',
          dim: 'rgb(var(--ink-dim) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
        },
        hairline: 'rgb(var(--hairline) / <alpha-value>)',
      },

      borderColor: {
        DEFAULT: 'rgb(var(--hairline) / 0.08)',
      },

      fontFamily: {
        sans: ['Readex Pro', 'Readex Pro Fallback', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        display: ['Space Grotesk', 'Space Grotesk Fallback', 'system-ui', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },

      fontSize: {
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.18em' }],
        index: ['0.8125rem', { lineHeight: '1', letterSpacing: '0.04em' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.65' }],
        body: ['1.0625rem', { lineHeight: '1.7' }],
        lead: ['clamp(1.125rem, 1.6vw, 1.3125rem)', { lineHeight: '1.6' }],
        h4: ['1.125rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        h3: ['clamp(1.25rem, 1.8vw, 1.5rem)', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        h2: ['clamp(1.875rem, 3.6vw, 3.125rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        hero: ['clamp(2.5rem, 7vw, 6rem)', { lineHeight: '0.98', letterSpacing: '-0.025em' }],
        statement: ['clamp(1.5rem, 3vw, 2.6rem)', { lineHeight: '1.12', letterSpacing: '-0.025em' }],
        counter: ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
      },

      spacing: {
        gutter: 'var(--gutter)',
        section: 'var(--section-gap)',
        rail: '2.5rem',
      },

      maxWidth: {
        container: 'var(--container-max)',
        measure: '68ch',
        'measure-sm': '54ch',
      },

      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '2px',
        md: '4px',
        lg: '4px',
        full: '9999px',
      },

      boxShadow: {
        'accent-glow': '0 18px 48px -24px rgb(var(--accent) / 0.55)',
        'card-hover': '0 24px 60px -32px rgb(var(--accent) / 0.6)',
      },

      transitionTimingFunction: {
        entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      transitionDuration: {
        hover: '200ms',
        header: '300ms',
        wizard: '400ms',
        overlay: '500ms',
        entrance: '600ms',
      },

      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' },
        },
        'scroll-cue': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translateY(14px)', opacity: '0' },
        },
        'pulse-ring': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
      },

      animation: {
        marquee: 'marquee var(--marquee-cycle) linear infinite',
        'scroll-cue': 'scroll-cue 2s var(--ease-entrance) infinite',
        'pulse-ring': 'pulse-ring 3s ease-in-out infinite',
      },

      zIndex: {
        rail: '30',
        header: '40',
        overlay: '50',
        skip: '60',
      },
    },
  },

  plugins: [],
} satisfies Config;
