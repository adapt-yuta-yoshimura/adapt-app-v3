import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreApplyUseCase } from './store-apply.usecase';
import { StoreCourseRepository } from './store-course.repository';
import { EnrollmentRepository } from './enrollment.repository';

/**
 * STU: StoreApply UseCase テスト（API-011）
 * 正常系 + 重複エラーをカバー
 */
describe('StoreApplyUseCase', () => {
  let useCase: StoreApplyUseCase;
  let courseRepo: {
    findById: ReturnType<typeof vi.fn>;
  };
  let enrollmentRepo: {
    findByCourseAndUser: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-learner-1';
  const courseId = 'course-1';

  beforeEach(() => {
    vi.clearAllMocks();
    courseRepo = {
      findById: vi.fn(),
    };
    enrollmentRepo = {
      findByCourseAndUser: vi.fn(),
      create: vi.fn(),
      updateStatus: vi.fn(),
    };

    useCase = new StoreApplyUseCase(
      courseRepo as unknown as StoreCourseRepository,
      enrollmentRepo as unknown as EnrollmentRepository,
    );
  });

  describe('applyCourse (API-011)', () => {
    it('正常系: 申込成功', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // enrollmentRepo.findByCourseAndUser → null（重複なし）
      // enrollmentRepo.create → mockEnrollment
      await expect(
        useCase.applyCourse(courseId, userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 重複申込エラー', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // enrollmentRepo.findByCourseAndUser → 既存Enrollment
      // ConflictException を期待
      await expect(
        useCase.applyCourse(courseId, userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });
  });
});
