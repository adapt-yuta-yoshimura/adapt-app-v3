// 参加者一覧（API-045）— TODO(TBD): 画面仕様確定後に実装
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function BootcampMembersPage() {
  const params = useParams();
  const courseId = typeof params.courseId === 'string' ? params.courseId : '';

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-xs tracking-[0.96px] text-grey3">
        <Link href="/instructor" className="hover:underline">
          TOP
        </Link>
        <span aria-hidden>/</span>
        <Link href="/instructor/courses" className="hover:underline">
          ブートキャンプ
        </Link>
        <span aria-hidden>/</span>
        <span className="text-black">参加者一覧</span>
      </nav>
      <p className="py-8 text-sm text-grey3">
        参加者一覧は準備中です。API-045（受講者名簿取得）と画面仕様確定後に実装します。
      </p>
    </div>
  );
}
