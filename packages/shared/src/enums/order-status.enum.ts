/**
 * 注文ステータス
 * @see schema.prisma - OrderStatus
 */
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}
