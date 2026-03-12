import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Course, CourseMember } from '@prisma/client';
import { CourseMemberRole } from '@prisma/client';
import { InstructorMemberUseCase } from './instructor-member.usecase';
import { CourseMemberOpsRepository } from './course-member-ops.repository';
import { CourseMemberRepository } from '../instructor-course/repositories/course-member.repository';
import { CourseRepository } from '../instructor-course/repositories/course.repository';

/**
 * INS-03: 受講者管理 UseCase テスト（API-045〜048）
 * 正常系・権限NG（403）・凍結423 をカバー
 */
describe('InstructorMemberUseCase', () => {
  let useCase: InstructorMemberUseCase;
  let courseMemberOpsRepo: {
    findMembersWithUsers: ReturnType<typeof vi.fn>;
    updateRole: ReturnType<typeof vi.fn>;
    revoke: ReturnType<typeof vi.fn>;
    findMembersForExport: ReturnType<typeof vi.fn>;
  };
  let memberRepo: {
    findByUserAndCourse: ReturnType<typeof vi.fn>;
  };
  let courseRepo: {
    findById: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-instructor-1';
  const courseId = 'course-1';
  const targetUserId = 'user-learner-1';

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

  const mockMemberInstructor: CourseMember = {
    ...mockMemberOwner,
    role: CourseMemberRole.instructor,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    courseMemberOpsRepo = {
      findMembersWithUsers: vi.fn(),
      updateRole: vi.fn(),
      revoke: vi.fn(),
      findMembersForExport: vi.fn(),
    };
    memberRepo = {
      findByUserAndCourse: vi.fn(),
    };
    courseRepo = {
      findById: vi.fn(),
    };

    useCase = new InstructorMemberUseCase(
      courseMemberOpsRepo as unknown as CourseMemberOpsRepository,
      memberRepo as unknown as CourseMemberRepository,
      courseRepo as unknown as CourseRepository,
    );
  });

  describe('getMembers (API-045)', () => {
    it('正常系: instructor が名簿取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.getMembers(courseId, userId)).rejects.toThrow(
        'Not implemented',
      );
    });

    it('権限NG: instructor 以外は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.getMembers(courseId, 'other-user')).rejects.toThrow(
        'Not implemented',
      );
    });
  });

  describe('changeRole (API-046)', () => {
    it('正常系: instructor_owner がロール変更', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // memberRepo.findByUserAndCourse → mockMemberOwner
      // courseRepo.findById → mockCourse (isFrozen: false)
      // courseMemberOpsRepo.updateRole 呼出し確認
      await expect(
        useCase.changeRole(courseId, targetUserId, { data: {} }, userId),
      ).rejects.toThrow('Not implemented');
    });

    it('権限NG: instructor_owner 以外は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.changeRole(courseId, targetUserId, { data: {} }, 'other-user'),
      ).rejects.toThrow('Not implemented');
    });

    it('凍結時: 423エラー', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // memberRepo.findByUserAndCourse → mockMemberOwner
      // courseRepo.findById → mockCourseFrozen
      // HttpException(423) を期待
      await expect(
        useCase.changeRole(courseId, targetUserId, { data: {} }, userId),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('revoke (API-047)', () => {
    it('正常系: instructor_owner が受講権限剥奪', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.revoke(courseId, targetUserId, userId),
      ).rejects.toThrow('Not implemented');
    });

    it('権限NG: instructor_owner 以外は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.revoke(courseId, targetUserId, 'other-user'),
      ).rejects.toThrow('Not implemented');
    });

    it('凍結時: 423エラー', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.revoke(courseId, targetUserId, userId),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('exportCsv (API-048)', () => {
    it('正常系: instructor_owner がCSV出力', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.exportCsv(courseId, userId)).rejects.toThrow(
        'Not implemented',
      );
    });

    it('権限NG: instructor_owner 以外は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.exportCsv(courseId, 'other-user')).rejects.toThrow(
        'Not implemented',
      );
    });
  });
});
