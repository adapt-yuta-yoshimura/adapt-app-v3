import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import { QueryProvider } from '@/lib/query-provider';
import { UserProvider } from '@/lib/user-context';
import '@/styles/globals.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'adapt - オンライン学習プラットフォーム',
  description: 'わかるより"デキる"体験を提供',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans">
        <QueryProvider>
          <UserProvider>{children}</UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
