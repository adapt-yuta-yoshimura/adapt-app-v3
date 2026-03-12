import { Injectable } from '@nestjs/common';
import type { CourseMember } from '@prisma/client';
import { CourseMemberRole } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * コースメンバーリポジトリ（講師向け）
 *
 * 注意: admin-course モジュールにも CourseMemberRepository が存在する。
 * 現時点では instructor 固有のクエリパターンを分離するため独立。
 * SoT: schema.prisma - CourseMember モデル
 */
@Injectable()
export class CourseMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<CourseMember | null> {
    return this.prisma.courseMember.findUnique({
      where: {
        courseId_userId: { courseId, userId },
      },
    });
  }

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
