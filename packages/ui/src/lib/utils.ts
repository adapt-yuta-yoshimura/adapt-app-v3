import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSクラス名を結合するユーティリティ
 * clsx + tailwind-merge でクラス名の衝突を解決する
 *
 * @example
 * cn('px-2 py-1', 'px-4') // → 'px-4 py-1'
 * cn('text-red-500', condition && 'text-blue-500') // 条件分岐
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
