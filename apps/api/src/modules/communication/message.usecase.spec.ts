import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  Course,
  CourseMember,
  CourseChannel,
  CourseMessage,
  CourseThread,
} from '@prisma/client';
import { CourseMemberRole } from '@prisma/client';
import { MessageUseCase } from './message.usecase';
import { MessageRepository } from './message.repository';
import { ThreadRepository } from './thread.repository';
import { ChannelRepository } from './channel.repository';
import { CourseMemberRepository } from '../instructor-course/repositories/course-member.repository';
import { CourseRepository } from '../instructor-course/repositories/course.repository';

/**
 * INS-03: メッセージ管理 UseCase テスト（API-053〜058）
 * 正常系・権限NG（403）・凍結423・owner_only・announcement制限 をカバー
 */
describe('MessageUseCase', () => {
  let useCase: MessageUseCase;
  let messageRepo: {
    findRootByChannelId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByThreadId: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateText: ReturnType<typeof vi.fn>;
    softDelete: ReturnType<typeof vi.fn>;
  };
  let threadRepo: {
    findByRootMessageId: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let channelRepo: {
    findById: ReturnType<typeof vi.fn>;
  };
  let memberRepo: {
    findByUserAndCourse: ReturnType<typeof vi.fn>;
  };
  let courseRepo: {
    findById: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-instructor-1';
  const learnerUserId = 'user-learner-1';
  const courseId = 'course-1';
  const channelId = 'channel-1';
  const messageId = 'message-1';
  const threadId = 'thread-1';

  const mockCourse: Course = {
    id: courseId,
    title: 'Test Course',
    description: null,
    ownerUserId: userId,
    createdByUserId: userId,
    status: 'active',
    style: 'bootcamp',
    approvalRequestedAt: null,
    approvedAt: null,
    approvedByUserId: null,
    isFrozen: false,
    frozenAt: null,
    frozenByUserId: null,
    freezeReason: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    catalogVisibility: 'public_listed',
    visibility: 'public',
  };

  const mockCourseFrozen: Course = {
    ...mockCourse,
    isFrozen: true,
    frozenAt: new Date(),
    frozenByUserId: 'op-1',
  };

  const mockMemberInstructor: CourseMember = {
    id: 'cm-1',
    courseId,
    userId,
    role: CourseMemberRole.instructor_owner,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMemberLearner: CourseMember = {
    id: 'cm-2',
    courseId,
    userId: learnerUserId,
    role: CourseMemberRole.learner,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChannelGeneral: CourseChannel = {
    id: channelId,
    courseId,
    type: 'general',
    postingMode: 'mixed',
    isFrozen: false,
    frozenAt: null,
    frozenByUserId: null,
    freezeReason: null,
    name: 'General',
    isManual: true,
    systemKey: null,
    visibility: 'public',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChannelAnnouncement: CourseChannel = {
    ...mockChannelGeneral,
    id: 'channel-announce',
    type: 'announcement',
    postingMode: 'threads_only',
    name: 'Announcements',
  };

  const mockMessage: CourseMessage = {
    id: messageId,
    channelId,
    threadId: null,
    authorCourseMemberId: 'cm-1',
    text: 'Hello world',
    isEmergency: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockThread: CourseThread = {
    id: threadId,
    channelId,
    rootMessageId: messageId,
    type: 'message_thread',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    messageRepo = {
      findRootByChannelId: vi.fn(),
      findById: vi.fn(),
      findByThreadId: vi.fn(),
      create: vi.fn(),
      updateText: vi.fn(),
      softDelete: vi.fn(),
    };
    threadRepo = {
      findByRootMessageId: vi.fn(),
      create: vi.fn(),
    };
    channelRepo = {
      findById: vi.fn(),
    };
    memberRepo = {
      findByUserAndCourse: vi.fn(),
    };
    courseRepo = {
      findById: vi.fn(),
    };

    useCase = new MessageUseCase(
      messageRepo as unknown as MessageRepository,
      threadRepo as unknown as ThreadRepository,
      channelRepo as unknown as ChannelRepository,
      memberRepo as unknown as CourseMemberRepository,
      courseRepo as unknown as CourseRepository,
    );
  });

  describe('getMessages (API-053)', () => {
    it('正常系: all_in_course メンバーがメッセージ履歴取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // channelRepo.findById → mockChannelGeneral
      // memberRepo.findByUserAndCourse → mockMemberLearner
      // messageRepo.findRootByChannelId → [mockMessage]
      await expect(
        useCase.getMessages(channelId, learnerUserId),
      ).rejects.toThrow('Not implemented');
    });

    it('権限NG: all_in_course 以外は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.getMessages(channelId, 'non-member'),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('post (API-054)', () => {
    it('正常系: メッセージ投稿（threads_only → 自動スレッド作成）', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // x-policy: threads_only(AUTO)
      // messageRepo.create + threadRepo.create 呼出し確認
      await expect(
        useCase.post(
          channelId,
          { text: 'Test' } as unknown as Parameters<typeof useCase.post>[1],
          userId,
        ),
      ).rejects.toThrow('Not implemented');
    });

    it('権限NG: all_in_course 以外は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.post(
          channelId,
          { text: 'Test' } as unknown as Parameters<typeof useCase.post>[1],
          'non-member',
        ),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('getThread (API-055)', () => {
    it('正常系: スレッド詳細取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.getThread(messageId, userId),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('reply (API-056)', () => {
    it('正常系: スレッドに返信', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.reply(
          messageId,
          { data: {} } as unknown as Parameters<typeof useCase.reply>[1],
          userId,
        ),
      ).rejects.toThrow('Not implemented');
    });

    it('THREAD_REPLY: announcement チャンネルは講師以外返信不可', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // channelRepo.findById → mockChannelAnnouncement
      // memberRepo.findByUserAndCourse → mockMemberLearner (learner)
      // ForbiddenException を期待
      await expect(
        useCase.reply(
          messageId,
          { data: {} } as unknown as Parameters<typeof useCase.reply>[1],
          learnerUserId,
        ),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('edit (API-057)', () => {
    it('正常系: owner がメッセージ編集', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // messageRepo.findById → mockMessage (authorCourseMemberId = cm-1)
      // memberRepo → userId 一致確認
      await expect(
        useCase.edit(
          messageId,
          { data: {} } as unknown as Parameters<typeof useCase.edit>[1],
          userId,
        ),
      ).rejects.toThrow('Not implemented');
    });

    it('owner_only: 他人のメッセージ編集は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.edit(
          messageId,
          { data: {} } as unknown as Parameters<typeof useCase.edit>[1],
          learnerUserId,
        ),
      ).rejects.toThrow('Not implemented');
    });

    it('凍結時: 423エラー', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // courseRepo.findById → mockCourseFrozen
      await expect(
        useCase.edit(
          messageId,
          { data: {} } as unknown as Parameters<typeof useCase.edit>[1],
          userId,
        ),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('delete (API-058)', () => {
    it('正常系: owner がメッセージ削除', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.delete(messageId, userId)).rejects.toThrow(
        'Not implemented',
      );
    });

    it('正常系: instructor が他人のメッセージ削除', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // 講師は他人の投稿も削除可
      await expect(useCase.delete(messageId, userId)).rejects.toThrow(
        'Not implemented',
      );
    });

    it('権限NG: owner でも instructor でもない場合は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.delete(messageId, 'other-user'),
      ).rejects.toThrow('Not implemented');
    });

    it('凍結時: 423エラー', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.delete(messageId, userId)).rejects.toThrow(
        'Not implemented',
      );
    });
  });
});
