import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-jp)', 'sans-serif'],
      },
      colors: {
        iris: {
          100: '#5D5FEF',
          80: '#7879F1',
          60: '#A5A6F6',
          light: '#ECECFC',
          bg: '#F8F8FF',
        },
        fuschia: {
          100: '#EF5DA8',
        },
        body: '#FCFCFC',
        grey2: '#878787',
        grey3: '#6D6D6D',
      },
    },
  },
  plugins: [],
};

export default config;
