import type { Config } from 'tailwindcss';

/**
 * adapt デザインシステム Tailwind設定
 *
 * - shadcn/ui互換のCSS変数ベースカラーシステム
 * - ダークモード対応（class戦略）
 * - レスポンシブデザイン
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../apps/web/src/**/*.{js,ts,jsx,tsx}',
    '../../apps/admin/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui互換 CSS変数カラー
        border: {
          DEFAULT: 'hsl(var(--border))',
          input: '#ECECFC', // Phase 0: Figma border-input
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // セマンティックカラー
        success: {
          DEFAULT: '#10b981',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#f59e0b',
          foreground: '#ffffff',
        },
        error: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        info: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        // Phase 0: Figma トークン（Adapt 共通 UI 用）
        iris: {
          100: '#5D5FEF',
          80: '#7B7DF3',
          60: '#A5A6F6',
          20: '#ECECFC',
          10: '#F8F8FF',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#6B7280',
          placeholder: '#A1A1A1',
          link: '#5D97E1',
        },
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        cta: '4px', // Phase 0: CTA buttons
        input: '5px', // Phase 0: Input fields
        card: '8px', // Phase 0: Cards, tables
      },
      fontSize: {
        'body-sm': ['13px', { lineHeight: '1.6', letterSpacing: '0.5px' }],
        caption: ['11px', { lineHeight: '1.6', letterSpacing: '0.5px' }],
        badge: ['11px', { lineHeight: '1', letterSpacing: '0.3px' }],
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'toast-slide-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'toast-slide-out': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'toast-slide-in': 'toast-slide-in 0.2s ease-out',
        'toast-slide-out': 'toast-slide-out 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
