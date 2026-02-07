import type { Config } from 'tailwindcss';

/**
 * Adapt Design System - Tailwind Configuration
 *
 * 【トークンソース】Figma adapt-Design (hIWNItIPSUj2AGZdJu4q3F)
 * 【対象】App 側 + Admin 側 共通
 * 【フォント】Noto Sans JP（Figma 変数 "本文〈行間小〉" 準拠）
 * 【カラー】Iris/100, Iris/60 等の Figma 変数準拠
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ===== COLORS (Figma tokens) =====
      colors: {
        // shadcn/ui 互換（globals.css の @apply および既存クラス用）
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Primary: Iris (Figma variable "Iris/100", "Iris/60")
        iris: {
          100: '#5D5FEF',
          80: '#7B7DF3',
          60: '#A5A6F6',
          20: '#ECECFC',
          10: '#F8F8FF',
        },
        // Accent: Fuschia (Figma variable "Fuschia/100")
        fuschia: {
          100: '#EF5DA8',
        },
        // Backgrounds
        surface: {
          page: '#FCFCFC',
          card: '#FDFDFD',
          white: '#FFFFFF',
        },
        // Borders
        border: {
          DEFAULT: '#EAEAEA',
          input: '#ECECFC',
        },
        // Text
        text: {
          primary: '#1A1A2E',
          secondary: '#6B7280',
          placeholder: '#A1A1A1',
          link: '#5D97E1',
        },
        // Semantic
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },

      // ===== FONT FAMILY =====
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },

      // ===== FONT SIZE (Figma typography styles) =====
      fontSize: {
        // 本文（行間小）: 14px / lh 1.6 / ls 0.56px
        body: ['14px', { lineHeight: '1.6', letterSpacing: '0.56px' }],
        // 本文小: 13px
        'body-sm': ['13px', { lineHeight: '1.6', letterSpacing: '0.5px' }],
        // ラベル: 12px / SemiBold
        label: ['12px', { lineHeight: '1.6', letterSpacing: '0.8px' }],
        // 見出し: 16px / Bold
        heading: ['16px', { lineHeight: '1.4', letterSpacing: '0.5px' }],
        // 大見出し: 18px / Bold
        'heading-lg': ['18px', { lineHeight: '1.4', letterSpacing: '0.5px' }],
        // キャプション: 11px
        caption: ['11px', { lineHeight: '1.6', letterSpacing: '0.5px' }],
        // バッジ: 11px / SemiBold
        badge: ['11px', { lineHeight: '1.0', letterSpacing: '0.3px' }],
        // ナビグループ: 10px / Bold / uppercase
        'nav-group': ['10px', { lineHeight: '1.0', letterSpacing: '1.5px' }],
      },

      // ===== BORDER RADIUS =====
      borderRadius: {
        cta: '4px', // CTA buttons (Figma login button)
        input: '5px', // Input fields
        card: '8px', // Cards, tables
        'card-lg': '12px', // Login card
        pill: '20px', // Badges, Google OAuth button (25px → 20px for badge)
        full: '9999px', // Avatars
      },

      // ===== SPACING (Admin layout) =====
      spacing: {
        sidebar: '240px', // Admin sidebar width
        header: '64px', // Admin header height
      },

      // ===== BOX SHADOW =====
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
