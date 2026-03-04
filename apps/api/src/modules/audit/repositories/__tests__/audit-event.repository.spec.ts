import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditEventType, GlobalRole } from '@prisma/client';
import { AuditEventRepository } from '../audit-event.repository';
import { PrismaService } from '../../../../common/prisma/prisma.service';

describe('AuditEventRepository', () => {
  let repo: AuditEventRepository;
  let mockPrisma: {
    auditEvent: { create: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      auditEvent: { create: vi.fn().mockResolvedValue(undefined) },
    };
    repo = new AuditEventRepository(mockPrisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('正常系: 監査イベントを記録する', async () => {
      await repo.create({
        actorUserId: 'actor-1',
        eventType: AuditEventType.user_created,
        actorGlobalRole: GlobalRole.operator,
        reason: 'User invited',
      });

      expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith({
        data: {
          actorUserId: 'actor-1',
          eventType: AuditEventType.user_created,
          actorGlobalRole: GlobalRole.operator,
          reason: 'User invited',
          courseId: undefined,
          channelId: undefined,
          messageId: undefined,
          metaJson: undefined,
          requestId: undefined,
          ipHash: undefined,
          userAgentHash: undefined,
        },
      });
    });

    it('正常系: metaJson とオプション項目を渡す', async () => {
      await repo.create({
        actorUserId: 'actor-1',
        eventType: AuditEventType.user_frozen,
        actorGlobalRole: GlobalRole.root_operator,
        reason: 'Frozen via admin',
        metaJson: { targetUserId: 'user-1' },
        courseId: 'course-1',
      });

      expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metaJson: { targetUserId: 'user-1' },
          courseId: 'course-1',
        }),
      });
    });
  });
});
