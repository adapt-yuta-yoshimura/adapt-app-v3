import { Injectable } from '@nestjs/common';
import { AuditEventType, GlobalRole } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * 監査イベントリポジトリ
 *
 * AuditEvent テーブルへのデータアクセスを担当。
 * SoT: schema.prisma - AuditEvent モデル
 * SoT: schema.prisma - AuditEventType enum
 *
 * 複数モジュール（admin-user, admin-operator, admin-course）で利用。
 */
@Injectable()
export class AuditEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 監査イベントを記録する
   *
   * @param params - 監査イベントの情報
   */
  async create(params: {
    actorUserId: string;
    eventType: AuditEventType;
    actorGlobalRole: GlobalRole;
    reason: string;
    courseId?: string;
    channelId?: string;
    messageId?: string;
    metaJson?: unknown;
    requestId?: string;
    ipHash?: string;
    userAgentHash?: string;
  }): Promise<void> {
    await this.prisma.auditEvent.create({
      data: {
        actorUserId: params.actorUserId,
        eventType: params.eventType,
        actorGlobalRole: params.actorGlobalRole,
        reason: params.reason,
        courseId: params.courseId ?? undefined,
        channelId: params.channelId ?? undefined,
        messageId: params.messageId ?? undefined,
        metaJson: params.metaJson ?? undefined,
        requestId: params.requestId ?? undefined,
        ipHash: params.ipHash ?? undefined,
        userAgentHash: params.userAgentHash ?? undefined,
      },
    });
  }

  /**
   * コース関連の監査イベント一覧を取得
   *
   * @param courseId - コースID
   */
  async findByCourseId(courseId: string): Promise<unknown[]> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
