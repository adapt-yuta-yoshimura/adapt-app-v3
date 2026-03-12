// INS-UI-23 ブートキャンプ運営（ホーム・通知）
'use client';

import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/lib/bootcamp-ops-api';

function formatNotificationDate(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    return d.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return createdAt;
  }
}

export default function BootcampOpsHomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-grey3">読み込み中…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-sm text-red-600">
        {error instanceof Error ? error.message : '通知の取得に失敗しました'}
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="space-y-0">
      {items.length === 0 ? (
        <p className="py-8 text-sm text-grey3">通知はありません</p>
      ) : (
        <ul className="divide-y divide-[#eaeaea]">
          {items.map((notification) => (
            <li key={notification.id}>
              <div className="flex items-start gap-3 rounded-lg bg-white px-4 py-4">
                <div className="flex shrink-0 items-center gap-2">
                  {!notification.isRead && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-fuschia-100"
                      aria-hidden
                    />
                  )}
                  <span className="text-xs tracking-[0.48px] text-grey2">
                    {formatNotificationDate(notification.createdAt)}
                  </span>
                </div>
                <p className="min-w-0 flex-1 text-sm leading-relaxed tracking-[0.56px] text-black">
                  {notification.body ?? notification.title}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
