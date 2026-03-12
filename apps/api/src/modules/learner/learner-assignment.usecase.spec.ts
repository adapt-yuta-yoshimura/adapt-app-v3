import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LearnerAssignmentUseCase } from './learner-assignment.usecase';
import { AssignmentRepository } from './assignment.repository';
import { SubmissionRepository } from './submission.repository';
import { EnrollmentRepository } from '../store/enrollment.repository';

/**
 * STU: LearnerAssignment UseCase テスト（API-017〜019）
 * 正常系 + 凍結423 + 再提出チェックをカバー
 */
describe('LearnerAssignmentUseCase', () => {
  let useCase: LearnerAssignmentUseCase;
  let assignmentRepo: {
    findByCourseIds: ReturnType<typeof vi.fn>;
    findByLessonId: ReturnType<typeof vi.fn>;
  };
  let submissionRepo: {
    findByUserAndAssignment: ReturnType<typeof vi.fn>;
    findByUserId: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let enrollmentRepo: {
    findByUserId: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-learner-1';
  const lessonId = 'lesson-1';

  beforeEach(() => {
    vi.clearAllMocks();
    assignmentRepo = {
      findByCourseIds: vi.fn(),
      findByLessonId: vi.fn(),
    };
    submissionRepo = {
      findByUserAndAssignment: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
    };
    enrollmentRepo = {
      findByUserId: vi.fn(),
    };

    useCase = new LearnerAssignmentUseCase(
      assignmentRepo as unknown as AssignmentRepository,
      submissionRepo as unknown as SubmissionRepository,
      enrollmentRepo as unknown as EnrollmentRepository,
    );
  });

  describe('getMyAssignments (API-017)', () => {
    it('正常系: 課題一覧取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.getMyAssignments(userId)).rejects.toThrow('Not implemented');
    });
  });

  describe('getAssignmentDetail (API-018)', () => {
    it('正常系: 課題詳細取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // assignmentRepo.findByLessonId → mockAssignment
      // submissionRepo.findByUserAndAssignment → mockSubmission
      await expect(useCase.getAssignmentDetail(lessonId, userId)).rejects.toThrow('Not implemented');
    });
  });

  describe('submitAssignment (API-019)', () => {
    it('正常系: 課題提出', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // submissionRepo.create → mockSubmission
      // threads_only: CourseThread 作成確認
      await expect(
        useCase.submitAssignment(lessonId, userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 凍結講座で 423', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // Course.isFrozen=true → HttpException(423)
      await expect(
        useCase.submitAssignment('frozen-lesson', userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 再提出不可で提出済み', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // Assignment.allowResubmission=false + 既存Submission
      // BadRequestException を期待
      await expect(
        useCase.submitAssignment(lessonId, userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });
  });
});
