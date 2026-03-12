import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LearnerEnrollmentUseCase } from './learner-enrollment.usecase';
import { EnrollmentRepository } from '../store/enrollment.repository';

/**
 * STU: LearnerEnrollment UseCase テスト（API-015）
 * 正常系をカバー
 */
describe('LearnerEnrollmentUseCase', () => {
  let useCase: LearnerEnrollmentUseCase;
  let enrollmentRepo: {
    findById: ReturnType<typeof vi.fn>;
    findByCourseAndUser: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-learner-1';
  const enrollmentId = 'enrollment-1';

  beforeEach(() => {
    vi.clearAllMocks();
    enrollmentRepo = {
      findById: vi.fn(),
      findByCourseAndUser: vi.fn(),
    };

    useCase = new LearnerEnrollmentUseCase(
      enrollmentRepo as unknown as EnrollmentRepository,
    );
  });

  describe('getEnrollmentStatus (API-015)', () => {
    it('正常系: 申込状況確認', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // enrollmentRepo.findById → mockEnrollment (userId一致)
      await expect(useCase.getEnrollmentStatus(enrollmentId, userId)).rejects.toThrow('Not implemented');
    });

    it('異常系: 他ユーザーの申込', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // enrollmentRepo.findById → mockEnrollment (userId不一致)
      // ForbiddenException を期待
      await expect(useCase.getEnrollmentStatus(enrollmentId, 'other-user')).rejects.toThrow('Not implemented');
    });
  });
});
