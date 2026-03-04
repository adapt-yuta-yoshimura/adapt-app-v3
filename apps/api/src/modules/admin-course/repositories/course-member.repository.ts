import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * コースメンバーリポジトリ
 *
 * CourseMember テーブルへのデータアクセスを担当。
 * SoT: schema.prisma - CourseMember モデル
 */
@Injectable()
export class CourseMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    courseId: string;
    userId: string;
    role: string;
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - CourseMember 作成（@@unique([courseId, userId]) 制約あり）
    throw new Error('Not implemented');
  }
}
