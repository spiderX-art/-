import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 30px 80px rgba(56, 189, 248, 0.22)',
        panel: '0 24px 70px rgba(0, 0, 0, 0.42)',
      },
    },
  },
  plugins: [],
} satisfies Config;
