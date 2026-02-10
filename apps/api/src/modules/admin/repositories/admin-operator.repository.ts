import { Injectable } from '@nestjs/common';
import { User, GlobalRole } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * Admin 用運営スタッフリポジトリ
 * User テーブルから globalRole が operator/root_operator のレコードを管理
 * （PlatformMembership テーブルは廃止済み）
 */
@Injectable()
export class AdminOperatorRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ページネーション付きで全運営スタッフを取得する
   * User.globalRole が operator または root_operator のユーザー
   */
  async findAll(skip: number, take: number): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        globalRole: { in: [GlobalRole.operator, GlobalRole.root_operator] },
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * 運営スタッフ総数を取得する
   */
  async count(): Promise<number> {
    return this.prisma.user.count({
      where: {
        globalRole: { in: [GlobalRole.operator, GlobalRole.root_operator] },
        isActive: true,
      },
    });
  }

  /**
   * userId でユーザーを取得し、運営スタッフかチェック
   */
  async findByUserId(userId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        globalRole: { in: [GlobalRole.operator, GlobalRole.root_operator] },
      },
    });
  }

  /**
   * 既存ユーザーを運営スタッフに昇格（globalRole を変更）
   */
  async promoteToOperator(data: {
    userId: string;
    globalRole: 'operator' | 'root_operator';
  }): Promise<User> {
    return this.prisma.user.update({
      where: { id: data.userId },
      data: { globalRole: data.globalRole as GlobalRole },
    });
  }

  /**
   * 運営スタッフのロールを変更（operator ⇔ root_operator）
   */
  async updateRole(data: {
    userId: string;
    globalRole: 'operator' | 'root_operator';
  }): Promise<User> {
    return this.prisma.user.update({
      where: { id: data.userId },
      data: { globalRole: data.globalRole as GlobalRole },
    });
  }
}
