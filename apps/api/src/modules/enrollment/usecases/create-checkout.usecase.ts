import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { StoreCourseRepository } from '../../store/repositories/store-course.repository';
import { OrderRepository } from '../repositories/order.repository';
import { PaymentRepository } from '../repositories/payment.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type CreateCheckoutResponse =
  paths['/api/v1/payments/stripe/checkout']['post']['responses']['201']['content']['application/json'];

/**
 * Stripe Checkout セッション生成 UseCase
 *
 * API-012: Stripeセッション生成
 * 新規モジュール → 1 UseCase 1 ファイル原則（CLAUDE.MD §12）
 * ※ Stripe SDK はインフラ依存のため、スタブ実装で対応
 */
@Injectable()
export class CreateCheckoutUseCase {
  constructor(
    private readonly storeCourseRepo: StoreCourseRepository,
    private readonly orderRepo: OrderRepository,
    private readonly paymentRepo: PaymentRepository,
  ) {}

  /**
   * API-012: Stripe Checkout セッション生成
   * x-roles: learner
   * x-policy: 423_ON_FROZEN
   */
  async execute(
    userId: string,
    courseId: string,
    couponCode?: string,
  ): Promise<CreateCheckoutResponse> {
    // TODO(TBD): Cursor実装
    // 1. 講座存在チェック → 404
    // 2. 凍結チェック（x-policy: 423_ON_FROZEN）→ 423
    // 3. クーポン検証（couponCode がある場合）
    // 4. Order 作成（status=pending）
    // 5. Stripe Checkout Session 生成（※スタブ実装）
    // 6. CheckoutResponse { sessionId, url } を返却
    //
    // ⚠ Stripe SDK はインフラ依存のため、スタブ実装で対応:
    //   return { sessionId: 'stub_session_' + orderId, url: 'https://checkout.stripe.com/stub' };
    throw new Error('Not implemented');
  }
}
