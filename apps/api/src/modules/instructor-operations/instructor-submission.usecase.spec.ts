import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Submission, CourseMember } from '@prisma/client';
import { CourseMemberRole } from '@prisma/client';
import { InstructorSubmissionUseCase } from './instructor-submission.usecase';
import { SubmissionRepository } from './submission.repository';
import { CourseMemberRepository } from '../instructor-course/repositories/course-member.repository';
import { MessageRepository } from '../communication/message.repository';
import { ThreadRepository } from '../communication/thread.repository';

/**
 * INS-03: 提出物管理 UseCase テスト（API-043〜044）
 * 正常系・権限NG（403）をカバー
 */
describe('InstructorSubmissionUseCase', () => {
  let useCase: InstructorSubmissionUseCase;
  let submissionRepo: {
    findByCourseId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let memberRepo: {
    findByUserAndCourse: ReturnType<typeof vi.fn>;
  };
  let messageRepo: {
    create: ReturnType<typeof vi.fn>;
  };
  let threadRepo: {
    findByRootMessageId: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-instructor-1';
  const courseId = 'course-1';
  const submissionId = 'submission-1';

  const mockMemberInstructor: CourseMember = {
    id: 'cm-1',
    courseId,
    userId,
    role: CourseMemberRole.instructor,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMemberAssistant: CourseMember = {
    ...mockMemberInstructor,
    role: CourseMemberRole.assistant,
  };

  const mockSubmission: Submission = {
    id: submissionId,
    assignmentId: 'assignment-1',
    courseId,
    userId: 'user-learner-1',
    threadId: 'thread-1',
    submittedAt: new Date(),
    status: 'submitted',
    gradedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    submissionRepo = {
      findByCourseId: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };
    memberRepo = {
      findByUserAndCourse: vi.fn(),
    };
    messageRepo = {
      create: vi.fn(),
    };
    threadRepo = {
      findByRootMessageId: vi.fn(),
    };

    useCase = new InstructorSubmissionUseCase(
      submissionRepo as unknown as SubmissionRepository,
      memberRepo as unknown as CourseMemberRepository,
      messageRepo as unknown as MessageRepository,
      threadRepo as unknown as ThreadRepository,
    );
  });

  describe('getSubmissions (API-043)', () => {
    it('正常系: instructor が提出一覧を取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // memberRepo.findByUserAndCourse → mockMemberInstructor
      // submissionRepo.findByCourseId → [mockSubmission]
      // 結果の items を検証
      await expect(useCase.getSubmissions(courseId, userId)).rejects.toThrow(
        'Not implemented',
      );
    });

    it('権限NG: instructor 以外は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // memberRepo.findByUserAndCourse → null (非メンバー)
      // ForbiddenException を期待
      await expect(useCase.getSubmissions(courseId, 'other-user')).rejects.toThrow(
        'Not implemented',
      );
    });
  });

  describe('evaluate (API-044)', () => {
    it('正常系: instructor が採点実行', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // submissionRepo.findById → mockSubmission
      // memberRepo.findByUserAndCourse → mockMemberInstructor
      // submissionRepo.updateStatus → updated submission
      // x-policy: THREAD_REPLY(AUTO) → messageRepo.create 呼出し確認
      await expect(
        useCase.evaluate(submissionId, { data: {} }, userId),
      ).rejects.toThrow('Not implemented');
    });

    it('正常系: assistant が採点実行', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // memberRepo.findByUserAndCourse → mockMemberAssistant
      await expect(
        useCase.evaluate(submissionId, { data: {} }, userId),
      ).rejects.toThrow('Not implemented');
    });

    it('権限NG: instructor / assistant 以外は403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.evaluate(submissionId, { data: {} }, 'other-user'),
      ).rejects.toThrow('Not implemented');
    });
  });
});
