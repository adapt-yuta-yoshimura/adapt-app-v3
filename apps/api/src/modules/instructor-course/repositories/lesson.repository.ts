import { Injectable } from '@nestjs/common';
import type { Lesson } from '@prisma/client';
import { LessonType } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

export type LessonCreateParams = {
  courseId: string;
  courseSectionId: string | null;
  title: string;
  type?: LessonType;
};

export type LessonUpdateParams = {
  title?: string;
  type?: LessonType;
  courseSectionId?: string | null;
};

/**
 * レッスンリポジトリ
 *
 * Lesson テーブルへのデータアクセス。
 * SoT: schema.prisma - Lesson モデル
 */
@Injectable()
export class LessonRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Lesson | null> {
    return this.prisma.lesson.findUnique({
      where: { id },
    });
  }

  async findBySectionId(sectionId: string): Promise<Lesson[]> {
    return this.prisma.lesson.findMany({
      where: { courseSectionId: sectionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(params: LessonCreateParams): Promise<Lesson> {
    return this.prisma.lesson.create({
      data: {
        courseId: params.courseId,
        courseSectionId: params.courseSectionId ?? undefined,
        title: params.title,
        type: params.type ?? 'text',
      },
    });
  }

  async update(id: string, params: LessonUpdateParams): Promise<Lesson> {
    return this.prisma.lesson.update({
      where: { id },
      data: {
        ...(params.title !== undefined && { title: params.title }),
        ...(params.type !== undefined && { type: params.type }),
        ...(params.courseSectionId !== undefined && {
          courseSectionId: params.courseSectionId,
        }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({
      where: { id },
    });
  }
}
