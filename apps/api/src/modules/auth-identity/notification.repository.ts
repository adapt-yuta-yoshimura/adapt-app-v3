import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Notification リポジトリ
 *
 * Notification テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - Notification model
 */
@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    // TODO(TBD): Cursor実装
    // ページネーション、createdAt DESC
    throw new Error('Not implemented');
  }

  async findById(id: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async markAsRead(id: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async markAllAsRead(userId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
