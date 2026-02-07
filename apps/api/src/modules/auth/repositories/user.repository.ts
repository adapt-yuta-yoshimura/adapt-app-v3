import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * ユーザーリポジトリ
 * Prismaを隠蔽し、ユーザーデータへのアクセスを提供する
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * IDでユーザーを取得する
   * @param id ユーザーID
   * @returns ユーザー情報、見つからない場合はnull
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * メールアドレスでユーザーを取得する
   * @param email メールアドレス
   * @returns ユーザー情報、見つからない場合はnull
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * ユーザーを新規作成する
   * @param data 作成データ
   * @returns 作成されたユーザー
   */
  async create(data: { email: string; name?: string }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        isActive: true,
      },
    });
  }

  /**
   * ユーザー情報を更新する
   * @param id ユーザーID
   * @param data 更新データ
   * @returns 更新されたユーザー
   */
  async update(
    id: string,
    data: { name?: string; isActive?: boolean },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
