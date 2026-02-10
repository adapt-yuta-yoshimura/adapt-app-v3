import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * Admin 用ユーザーリポジトリ
 * ユーザー一覧・凍結操作のためのデータアクセス（Prisma 隠蔽）
 */
@Injectable()
export class AdminUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ページネーション付きで全ユーザーを取得する
   */
  async findAll(skip: number, take: number): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * ユーザー総数を取得する
   */
  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  /**
   * ID でユーザーを取得する
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Email でユーザーを取得する
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * ユーザーの isActive を更新する（凍結/解除）
   */
  async updateIsActive(id: string, isActive: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }
}
