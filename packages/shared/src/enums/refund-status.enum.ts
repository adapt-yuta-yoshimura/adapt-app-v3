/**
 * 返金ステータス
 * @see schema.prisma - RefundStatus
 */
export enum RefundStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
}
