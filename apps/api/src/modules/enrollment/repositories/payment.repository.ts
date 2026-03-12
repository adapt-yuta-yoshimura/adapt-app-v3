import { Injectable } from '@nestjs/common';
import type { Payment, PaymentProvider } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * Payment リポジトリ
 *
 * Payment テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - Payment model
 */
@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    courseId: string;
    amount: number;
    currency: string;
    provider: PaymentProvider;
  }): Promise<Payment> {
    // TODO(TBD): Cursor実装
    // - status: 'pending'
    throw new Error('Not implemented');
  }
}
