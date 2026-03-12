import { Injectable } from '@nestjs/common';
import type { CourseSection, Lesson } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

export type CourseSectionCreateParams = {
  courseId: string;
  title: string;
  order: number;
};

export type CourseSectionUpdateParams = {
  title?: string;
  order?: number;
};

export type CourseSectionWithLessons = CourseSection & { lessons: Lesson[] };

/**
 * セクションリポジトリ
 *
 * CourseSection テーブルへのデータアクセス。
 * SoT: schema.prisma - CourseSection モデル
 */
@Injectable()
export class CourseSectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** コースに属するセクション一覧（order 昇順、レッスン含む） */
  async findByCourseId(courseId: string): Promise<CourseSectionWithLessons[]> {
    return this.prisma.courseSection.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findById(id: string): Promise<CourseSection | null> {
    return this.prisma.courseSection.findUnique({
      where: { id },
    });
  }

  async create(params: CourseSectionCreateParams): Promise<CourseSection> {
    return this.prisma.courseSection.create({
      data: {
        courseId: params.courseId,
        title: params.title,
        order: params.order,
      },
    });
  }

  async update(
    id: string,
    params: CourseSectionUpdateParams,
  ): Promise<CourseSection> {
    return this.prisma.courseSection.update({
      where: { id },
      data: {
        ...(params.title !== undefined && { title: params.title }),
        ...(params.order !== undefined && { order: params.order }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.courseSection.delete({
      where: { id },
    });
  }
}
