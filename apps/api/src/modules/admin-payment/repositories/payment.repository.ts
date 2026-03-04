import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * 決済リポジトリ
 *
 * Payment テーブルへのデータアクセスを担当。
 * SoT: schema.prisma - Payment モデル
 *
 * PaymentSummaryView の userName / courseTitle は
 * User / Course テーブルとの結合で取得する。
 */
@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyWithRelations(params?: {
    status?: string;
    provider?: string;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - Payment + User（userId → userName）+ Course（courseId → courseTitle）を結合
    // - フィルタ: status, provider
    // - ソート: sortBy（amount, createdAt, status 等）、sortOrder（asc/desc）
    // - ページネーション: page, perPage
    // - 戻り値: { items: PaymentWithRelations[], totalCount: number }
    throw new Error('Not implemented');
  }
}
