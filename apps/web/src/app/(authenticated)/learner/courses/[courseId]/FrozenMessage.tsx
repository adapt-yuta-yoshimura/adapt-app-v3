'use client';

/**
 * 凍結中講座メッセージ（423 エラー時）
 */
export function FrozenMessage() {
  return (
    <div className="rounded-lg border border-iris-60 bg-white p-6 text-center">
      <p className="text-black font-medium">この講座は現在凍結中です</p>
      <p className="mt-2 text-sm text-grey3">
        しばらくしてから再度お試しください。
      </p>
    </div>
  );
}
