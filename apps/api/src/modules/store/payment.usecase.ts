import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { PaymentRepository } from './payment.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type CheckoutRequest =
  paths['/api/v1/payments/stripe/checkout']['post']['requestBody']['content']['application/json'];
type CheckoutResponse =
  paths['/api/v1/payments/stripe/checkout']['post']['responses']['201']['content']['application/json'];

/**
 * 決済 UseCase
 *
 * API-012: Stripeセッション生成
 * ※ Stripe SDK / API キーはインフラ依存。スタブ実装で対応。
 */
@Injectable()
export class PaymentUseCase {
  constructor(
    private readonly paymentRepo: PaymentRepository,
  ) {}

  /**
   * API-012: Stripeセッション生成
   * x-roles: learner
   * x-policy: 423_ON_FROZEN
   */
  async createCheckoutSession(userId: string, body: CheckoutRequest): Promise<CheckoutResponse> {
    // TODO(TBD): Cursor実装
    // 1. learner ロール確認（RolesGuard で担保済み）
    // 2. 凍結チェック（対象 Course）→ 423 HttpException
    // 3. Order 作成
    // 4. Stripe Checkout Session 作成 → sessionUrl 返却
    // ※ Stripe SDK 呼び出し — インフラ依存。スタブ実装。
    throw new Error('Not implemented');
  }
}
