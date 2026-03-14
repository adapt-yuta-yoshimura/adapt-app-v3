/**
 * 受講者共通レイアウト（STU 共通）
 * 認証・サイドバーは (authenticated)/layout の WebLayout で適用されるため、
 * ここでは子要素をそのまま表示する。
 */
export function LearnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
