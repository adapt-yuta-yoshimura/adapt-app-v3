/**
 * ブートキャンプ運営ルート用レイアウト
 * BootcampOpsLayout は WebLayout 側で path 判定により適用される
 */
export default function BootcampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
