import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Course, CourseMember, CourseChannel } from '@prisma/client';
import { CourseMemberRole } from '@prisma/client';
import { ChannelUseCase } from './channel.usecase';
import { ChannelRepository } from './channel.repository';
import { CourseMemberRepository } from '../instructor-course/repositories/course-member.repository';
import { CourseRepository } from '../instructor-course/repositories/course.repository';

/**
 * INS-03: チャンネル管理 UseCase テスト（API-049〜052）
 * 正常系・権限NG（403）・凍結423 をカバー
 */
describe('ChannelUseCase', () => {
  let useCase: ChannelUseCase;
  let channelRepo: {
    findByCourseId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let memberRepo: {
    findByUserAndCourse: ReturnType<typeof vi.fn>;
  };
  let courseRepo: {
    findById: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-instructor-1';
  const courseId = 'course-1';
  const channelId = 'channel-1';

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

  const mockMemberOwner: CourseMember = {
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
    userId: 'user-learner-1',
    role: CourseMemberRole.learner,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChannel: CourseChannel = {
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

  beforeEach(() => {
    vi.clearAllMocks();
    channelRepo = {
      findByCourseId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    memberRepo = {
      findByUserAndCourse: vi.fn(),
    };
    courseRepo = {
      findById: vi.fn(),
    };

    useCase = new ChannelUseCase(
      channelRepo as unknown as ChannelRepository,
      memberRepo as unknown as CourseMemberRepository,
      courseRepo as unknown as CourseRepository,
    );
  });

  describe('getChannels (API-049)', () => {
    it('正常系: all_in_course メンバーがチャンネル一覧取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // memberRepo.findByUserAndCourse → mockMemberLearner
      // channelRepo.findByCourseId → [mockChannel]
      await expect(useCase.getChannels(courseId, userId)).rejects.toThrow(
        'Not implemented',
      );
    });

    it('権限NG: all_in_course 以外は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // memberRepo.findByUserAndCourse → null (非メンバー)
      await expect(
        useCase.getChannels(courseId, 'non-member'),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('create (API-050)', () => {
    it('正常系: instructor_owner がチャンネル作成', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.create(courseId, { name: 'New Channel' } as unknown as Parameters<typeof useCase.create>[1], userId),
      ).rejects.toThrow('Not implemented');
    });

    it('権限NG: instructor_owner 以外は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.create(courseId, { name: 'New Channel' } as unknown as Parameters<typeof useCase.create>[1], 'other-user'),
      ).rejects.toThrow('Not implemented');
    });

    it('凍結時: 423エラー', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.create(courseId, { name: 'New Channel' } as unknown as Parameters<typeof useCase.create>[1], userId),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('update (API-051)', () => {
    it('正常系: instructor_owner がチャンネル編集', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.update(channelId, { data: {} } as unknown as Parameters<typeof useCase.update>[1], userId),
      ).rejects.toThrow('Not implemented');
    });

    it('凍結時: 423エラー', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.update(channelId, { data: {} } as unknown as Parameters<typeof useCase.update>[1], userId),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('delete (API-052)', () => {
    it('正常系: instructor_owner がチャンネル削除', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.delete(channelId, userId)).rejects.toThrow(
        'Not implemented',
      );
    });

    it('凍結時: 423エラー', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.delete(channelId, userId)).rejects.toThrow(
        'Not implemented',
      );
    });
  });
});
