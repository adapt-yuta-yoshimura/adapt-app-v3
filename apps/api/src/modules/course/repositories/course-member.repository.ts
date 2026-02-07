import { Injectable } from '@nestjs/common';
import { CourseMember, CourseMemberRole } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/** メンバー作成データ */
export interface CreateMemberData {
  courseId: string;
  userId: string;
  role: CourseMemberRole;
}

/**
 * コースメンバーリポジトリ
 * コースメンバーテーブルへのデータアクセスを提供する
 * @see schema.prisma - CourseMember
 */
@Injectable()
export class CourseMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ユーザーIDとコースIDでメンバーを取得する
   * @param userId ユーザーID
   * @param courseId コースID
   * @returns メンバー情報、見つからない場合はnull
   */
  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<CourseMember | null> {
    return this.prisma.courseMember.findFirst({
      where: { userId, courseId },
    });
  }

  /**
   * コースIDでメンバー一覧を取得する
   * @param courseId コースID
   * @returns メンバー配列
   */
  async findByCourse(courseId: string): Promise<CourseMember[]> {
    return this.prisma.courseMember.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * ユーザーIDでメンバー情報一覧を取得する（全コース横断）
   * @param userId ユーザーID
   * @returns メンバー配列
   */
  async findByUser(userId: string): Promise<CourseMember[]> {
    return this.prisma.courseMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * ユーザーが講師（instructor_owner または instructor）として参加しているコースIDを取得する
   * @param userId ユーザーID
   * @returns コースIDの配列
   */
  async findInstructorCourseIds(userId: string): Promise<string[]> {
    const members = await this.prisma.courseMember.findMany({
      where: {
        userId,
        role: { in: ['instructor_owner', 'instructor', 'assistant'] },
      },
      select: { courseId: true },
    });

    return members.map((m) => m.courseId);
  }

  /**
   * コースメンバーを新規作成する
   * @param data メンバー作成データ
   * @returns 作成されたメンバー
   */
  async create(data: CreateMemberData): Promise<CourseMember> {
    return this.prisma.courseMember.create({
      data: {
        courseId: data.courseId,
        userId: data.userId,
        role: data.role,
      },
    });
  }

  /**
   * メンバーのロールを更新する
   * @param id メンバーID
   * @param role 新しいロール
   * @returns 更新されたメンバー
   */
  async updateRole(id: string, role: CourseMemberRole): Promise<CourseMember> {
    return this.prisma.courseMember.update({
      where: { id },
      data: { role },
    });
  }
}
