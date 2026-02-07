/**
 * 決済事業者
 * @see schema.prisma - PaymentProvider
 */
export enum PaymentProvider {
  STRIPE = 'stripe',
  MANUAL = 'manual',
}
