import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LearnerRecordsUseCase } from './learner-records.usecase';
import { CourseEnrollmentRepository } from '../../enrollment/repositories/course-enrollment.repository';
import { SubmissionRepository } from '../repositories/submission.repository';
import { LearnerCourseRepository } from '../repositories/learner-course.repository';

/**
 * STU: LearnerRecords UseCase テスト（API-020〜021）
 * 正常系をカバー
 */
describe('LearnerRecordsUseCase', () => {
  let useCase: LearnerRecordsUseCase;
  let enrollmentRepo: {
    findByUserId: ReturnType<typeof vi.fn>;
  };
  let submissionRepo: {
    countByUser: ReturnType<typeof vi.fn>;
  };
  let courseRepo: {
    findLiveLessonsByUser: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-learner-1';

  beforeEach(() => {
    vi.clearAllMocks();
    enrollmentRepo = {
      findByUserId: vi.fn(),
    };
    submissionRepo = {
      countByUser: vi.fn(),
    };
    courseRepo = {
      findLiveLessonsByUser: vi.fn(),
    };

    useCase = new LearnerRecordsUseCase(
      enrollmentRepo as unknown as CourseEnrollmentRepository,
      submissionRepo as unknown as SubmissionRepository,
      courseRepo as unknown as LearnerCourseRepository,
    );
  });

  describe('getRecords (API-020)', () => {
    it('正常系: 学習実績取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(useCase.getRecords(userId)).rejects.toThrow('Not implemented');
    });
  });

  describe('getCalendar (API-021)', () => {
    it('正常系: カレンダー取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // courseRepo.findLiveLessonsByUser → [mockLesson]
      await expect(useCase.getCalendar(userId)).rejects.toThrow('Not implemented');
    });
  });
});
