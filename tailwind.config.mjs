/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      colors: {
        apple: {
          bg: '#F5F5F7',
          surface: '#FFFFFF',
          fill: '#F2F2F7',
          label: '#1D1D1F',
          secondary: '#6E6E73',
          tertiary: '#86868B',
          accent: '#0071E3',
          'accent-dark': '#0077ED',
          separator: '#D2D2D7',
          'separator-light': '#E8E8ED',
        },
      },
      boxShadow: {
        card: '0 2px 20px rgba(0,0,0,0.05)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.10)',
        nav: '0 0.5px 0 rgba(0,0,0,0.08)',
      },
      letterSpacing: {
        tight: '-0.025em',
        tighter: '-0.04em',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
