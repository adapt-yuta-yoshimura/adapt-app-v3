import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';

/**
 * 決済管理ユースケース（Admin）
 *
 * ADMIN-05チケット: 決済履歴の一覧取得
 */
@Injectable()
export class AdminPaymentUseCase {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  /**
   * API-ADMIN-19: 決済履歴一覧
   * - DB: Payment + User（userName結合）+ Course（courseTitle結合）
   * - PaymentSummaryView にマッピング
   */
  async listPayments(): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - paymentRepo.findManyWithRelations() で決済一覧取得
    // - User.name → userName、Course.title → courseTitle を結合
    // - PaymentSummaryView 形式に変換
    // - ページネーション（ListMeta）
    throw new Error('Not implemented');
  }
}
