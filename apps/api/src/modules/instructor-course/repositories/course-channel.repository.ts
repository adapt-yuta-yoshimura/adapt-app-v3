import { Injectable } from '@nestjs/common';
import type { CourseChannel } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * コースチャンネルリポジトリ（講師向け）
 *
 * CourseDetailView の channels 取得用。
 * SoT: schema.prisma - CourseChannel モデル
 */
@Injectable()
export class CourseChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByCourseId(courseId: string): Promise<CourseChannel[]> {
    return this.prisma.courseChannel.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
