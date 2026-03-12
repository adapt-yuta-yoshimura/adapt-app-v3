import { Injectable } from '@nestjs/common';
import type { CourseMember, CourseMemberRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CourseMemberOpsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMembersWithUsers(
    courseId: string,
  ): Promise<CourseMember[]> {
    // TODO(TBD): Cursor実装 — CourseMember + User 結合、CourseEnrollment 進捗情報結合
    // NOTE: schema.prisma の CourseMember には isActive / joinedAt フィールドが存在しない（SoT差分）
    throw new Error('Not implemented');
  }

  async updateRole(
    courseId: string,
    targetUserId: string,
    newRole: CourseMemberRole,
  ): Promise<CourseMember> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async revoke(courseId: string, targetUserId: string): Promise<CourseMember> {
    // TODO(TBD): Cursor実装
    // NOTE: schema.prisma の CourseMember には isActive フィールドが存在しない（SoT差分）
    // revoke の具体的な実装方式は要検討
    throw new Error('Not implemented');
  }

  async findMembersForExport(courseId: string): Promise<CourseMember[]> {
    // TODO(TBD): Cursor実装 — CSV出力用に名簿 + 進捗データ結合
    throw new Error('Not implemented');
  }
}
