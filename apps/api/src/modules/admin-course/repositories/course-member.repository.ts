import { Injectable } from '@nestjs/common';
import type { CourseMember } from '@prisma/client';
import { CourseMemberRole } from '@prisma/client';
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
    role: CourseMemberRole;
  }): Promise<CourseMember> {
    return this.prisma.courseMember.create({
      data: {
        courseId: params.courseId,
        userId: params.userId,
        role: params.role,
      },
    });
  }
}
