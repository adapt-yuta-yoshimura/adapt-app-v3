import { Injectable } from '@nestjs/common';
import { AuditEventType, GlobalRole, Prisma } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * 監査イベント用リポジトリ
 * AuditEvent の INSERT のみ担当
 */
export interface AuditEventCreateData {
  actorUserId: string;
  eventType: AuditEventType;
  actorGlobalRole: GlobalRole;
  reason: string;
  metaJson?: Prisma.InputJsonValue;
  courseId?: string | null;
  channelId?: string | null;
  messageId?: string | null;
}

@Injectable()
export class AuditEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 監査イベントを 1 件作成する
   */
  async create(data: AuditEventCreateData): Promise<void> {
    await this.prisma.auditEvent.create({
      data: {
        actorUserId: data.actorUserId,
        eventType: data.eventType,
        actorGlobalRole: data.actorGlobalRole,
        reason: data.reason,
        metaJson: data.metaJson ?? undefined,
        courseId: data.courseId ?? null,
        channelId: data.channelId ?? null,
        messageId: data.messageId ?? null,
      },
    });
  }
}
