import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'adapt Admin',
  description: 'adapt オンライン学習プラットフォーム 管理画面',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
