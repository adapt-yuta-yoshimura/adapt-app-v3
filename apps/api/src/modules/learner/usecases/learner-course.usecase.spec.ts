import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LearnerCourseUseCase } from './learner-course.usecase';
import { LearnerCourseRepository } from '../repositories/learner-course.repository';
import { CourseEnrollmentRepository } from '../../enrollment/repositories/course-enrollment.repository';

/**
 * STU: LearnerCourse UseCase テスト（API-013, 014, 016, 022）
 * 正常系 + 凍結423 + 未受講403をカバー
 */
describe('LearnerCourseUseCase', () => {
  let useCase: LearnerCourseUseCase;
  let courseRepo: {
    findById: ReturnType<typeof vi.fn>;
    findWithSectionsAndLessons: ReturnType<typeof vi.fn>;
  };
  let enrollmentRepo: {
    findByCourseAndUser: ReturnType<typeof vi.fn>;
    findByUserId: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-learner-1';
  const courseId = 'course-1';

  beforeEach(() => {
    vi.clearAllMocks();
    courseRepo = {
      findById: vi.fn(),
      findWithSectionsAndLessons: vi.fn(),
    };
    enrollmentRepo = {
      findByCourseAndUser: vi.fn(),
      findByUserId: vi.fn(),
      updateStatus: vi.fn(),
    };

    useCase = new LearnerCourseUseCase(
      courseRepo as unknown as LearnerCourseRepository,
      enrollmentRepo as unknown as CourseEnrollmentRepository,
    );
  });

  describe('getMyCourses (API-013)', () => {
    it('正常系: マイ講座一覧取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // enrollmentRepo.findByUserId → [mockEnrollment]
      await expect(useCase.getMyCourses(userId)).rejects.toThrow('Not implemented');
    });

    it('正常系: 未受講者は空配列', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // enrollmentRepo.findByUserId → []
      await expect(useCase.getMyCourses('no-courses-user')).rejects.toThrow('Not implemented');
    });
  });

  describe('getCourseDetail (API-014)', () => {
    it('正常系: 受講中講座詳細取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // enrollmentRepo.findByCourseAndUser → mockEnrollment
      // courseRepo.findWithSectionsAndLessons → mockCourse
      await expect(useCase.getCourseDetail(courseId, userId)).rejects.toThrow('Not implemented');
    });

    it('異常系: 凍結講座で 423', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // courseRepo.findById → { isFrozen: true }
      // HttpException(423) を期待
      await expect(useCase.getCourseDetail('frozen-course', userId)).rejects.toThrow('Not implemented');
    });

    it('異常系: 未受講で 403', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // enrollmentRepo.findByCourseAndUser → null
      // ForbiddenException を期待
      await expect(useCase.getCourseDetail(courseId, 'other-user')).rejects.toThrow('Not implemented');
    });
  });

  describe('getSideMenu (API-016)', () => {
    it('正常系: サイドメニュー取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.getSideMenu(courseId, userId)).rejects.toThrow('Not implemented');
    });
  });

  describe('completeCourse (API-022)', () => {
    it('正常系: コース修了', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // enrollmentRepo.updateStatus → completed
      await expect(
        useCase.completeCourse(courseId, userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });
  });
});
