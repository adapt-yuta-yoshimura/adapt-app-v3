import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Assignment リポジトリ
 *
 * Assignment テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - Assignment model
 */
@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCourseIds(courseIds: string[]) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findByLessonId(lessonId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
