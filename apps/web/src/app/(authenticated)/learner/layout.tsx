import { LearnerLayout } from '@/components/layouts/LearnerLayout';

/**
 * 受講者エリア — レイアウトは (authenticated)/layout.tsx の WebLayout で共通適用
 */
export default function LearnerRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LearnerLayout>{children}</LearnerLayout>;
}
