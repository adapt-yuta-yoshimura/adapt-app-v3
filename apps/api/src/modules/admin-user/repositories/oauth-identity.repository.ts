import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * OAuthIdentity の lastLoginAt 取得用リポジトリ
 *
 * Admin ユーザー一覧の UserAdminView.lastLoginAt を取得するためのみ使用。
 * SoT: schema.prisma - OAuthIdentity モデル
 */
@Injectable()
export class OAuthIdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 指定ユーザーID群について、各ユーザーの最終ログイン日時（最大 lastLoginAt）を返す
   *
   * @param userIds - ユーザーIDの配列
   * @returns userId -> lastLoginAt (Date) のマップ。該当なしは含まない
   */
  async findLastLoginAtByUserIds(userIds: string[]): Promise<Record<string, Date>> {
    if (userIds.length === 0) {
      return {};
    }
    const rows = await this.prisma.oAuthIdentity.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _max: { lastLoginAt: true },
    });
    const map: Record<string, Date> = {};
    for (const row of rows) {
      if (row._max.lastLoginAt) {
        map[row.userId] = row._max.lastLoginAt;
      }
    }
    return map;
  }
}
