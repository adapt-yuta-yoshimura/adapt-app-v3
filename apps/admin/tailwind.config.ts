import type { Config } from 'tailwindcss';

/**
 * Admin カラートークン（.cursorrules §19.4 準拠・値の変更禁止）
 */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#0F172A',
        accent: '#3B82F6',
        bg: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E2E8F0',
        text: '#0F172A',
        textSecondary: '#334155',
        textTertiary: '#64748B',
        textMuted: '#94A3B8',
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-jp)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
