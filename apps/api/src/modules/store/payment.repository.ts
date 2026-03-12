import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Payment リポジトリ
 *
 * Payment, Order テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - Payment, Order model
 */
@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async createOrder(data: { userId: string; courseId: string; amount: number; currency: string }) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async createPayment(data: { userId: string; courseId: string; amount: number; currency: string; provider: string }) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
