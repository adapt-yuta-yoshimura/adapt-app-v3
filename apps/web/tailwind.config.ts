import type { Config } from 'tailwindcss';
import sharedConfig from '../../packages/ui/tailwind.config';

/**
 * apps/web Tailwind設定
 * @adapt/ui の共有設定をプリセットとして使用し、ダークモード・CSS変数を統合
 */
const config: Config = {
  presets: [sharedConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
};

export default config;
