import { Injectable } from '@nestjs/common';
import type { CourseThread } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ThreadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByRootMessageId(rootMessageId: string): Promise<CourseThread | null> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async create(params: {
    channelId: string;
    rootMessageId: string;
    type: string;
  }): Promise<CourseThread> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
