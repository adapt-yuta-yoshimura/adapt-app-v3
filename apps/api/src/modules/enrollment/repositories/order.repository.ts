import { Injectable } from '@nestjs/common';
import type { Order } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * Order リポジトリ
 *
 * Order テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - Order model
 */
@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    courseId: string;
    amount: number;
    currency: string;
    paymentProvider: string;
  }): Promise<Order> {
    // TODO(TBD): Cursor実装
    // - status: 'pending'
    throw new Error('Not implemented');
  }
}
