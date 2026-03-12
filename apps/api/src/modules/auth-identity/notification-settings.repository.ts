import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * NotificationSettings リポジトリ
 *
 * UserNotificationSetting テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - UserNotificationSetting model
 */
@Injectable()
export class NotificationSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async upsert(userId: string, data: Record<string, unknown>) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
