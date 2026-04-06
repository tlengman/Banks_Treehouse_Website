import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
        forest: {
          50: '#f0f7f2',
          100: '#dceee1',
          200: '#b8dcc3',
          300: '#8bc49f',
          400: '#5ea87a',
          500: '#225739',
          600: '#1d4a31',
          700: '#183c28',
          800: '#132e1f',
          900: '#0e2117',
        },
        wood: {
          50: '#fdf8f0',
          100: '#faeed9',
          200: '#f2d5a8',
          300: '#e6b56e',
          400: '#d4943e',
          500: '#C17A37',
          600: '#a5652d',
          700: '#875024',
          800: '#6a3d1c',
          900: '#352618',
        },
        cream: '#FCF9F3',
        bark: '#352618',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        accent: ['Caveat', 'cursive'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      animation: {
        fade: 'fadeInUp 1s both',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(2rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
  ],
  darkMode: 'class',
};
