import { redirect } from 'next/navigation';

/**
 * ルート / は /store へリダイレクト
 */
export default function RootPage() {
  redirect('/store');
}
