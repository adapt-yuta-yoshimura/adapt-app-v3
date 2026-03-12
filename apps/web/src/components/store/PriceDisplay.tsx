/**
 * 価格表示（¥ + カンマ区切り）
 * 例: ¥8,000 / ¥999,000
 */
export function PriceDisplay({ amount }: { amount: number }) {
  const formatted = amount.toLocaleString('ja-JP');
  return (
    <span className="text-sm font-medium text-black">
      ¥{formatted}
    </span>
  );
}
