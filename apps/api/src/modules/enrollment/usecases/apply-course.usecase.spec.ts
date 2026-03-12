import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplyCourseUseCase } from './apply-course.usecase';
import { CourseEnrollmentRepository } from '../repositories/course-enrollment.repository';
import { StoreCourseRepository } from '../../store/repositories/store-course.repository';

/**
 * STU-01: ApplyCourse UseCase テスト（API-011）
 * 正常系 + 重複エラー + 404 をカバー
 */
describe('ApplyCourseUseCase', () => {
  let useCase: ApplyCourseUseCase;
  let courseEnrollmentRepo: {
    findByUserAndCourse: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let storeCourseRepo: {
    findActivePublic: ReturnType<typeof vi.fn>;
    findPublicById: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-learner-1';
  const courseId = 'course-1';

  beforeEach(() => {
    vi.clearAllMocks();
    courseEnrollmentRepo = {
      findByUserAndCourse: vi.fn(),
      create: vi.fn(),
    };
    storeCourseRepo = {
      findActivePublic: vi.fn(),
      findPublicById: vi.fn(),
    };

    useCase = new ApplyCourseUseCase(
      courseEnrollmentRepo as unknown as CourseEnrollmentRepository,
      storeCourseRepo as unknown as StoreCourseRepository,
    );
  });

  describe('execute (API-011)', () => {
    it('正常系: CourseEnrollment が created（201）', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // storeCourseRepo.findPublicById → mockCourse (status=active)
      // courseEnrollmentRepo.findByUserAndCourse → null（重複なし）
      // courseEnrollmentRepo.create → mockEnrollment
      await expect(
        useCase.execute(userId, courseId),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 409 - 既に enrollment が存在', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // courseEnrollmentRepo.findByUserAndCourse → 既存Enrollment
      // ConflictException を期待
      await expect(
        useCase.execute(userId, courseId),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 403 - learner 以外のロール', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // RolesGuard で担保されるが、UseCase 単体テストとしてもカバー
      await expect(
        useCase.execute(userId, courseId),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 404 - 存在しない講座', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // storeCourseRepo.findPublicById → null
      // NotFoundException を期待
      await expect(
        useCase.execute(userId, courseId),
      ).rejects.toThrow('Not implemented');
    });
  });
});
