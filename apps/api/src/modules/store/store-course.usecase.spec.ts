import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreCourseUseCase } from './store-course.usecase';
import { StoreCourseRepository } from './store-course.repository';

/**
 * STU: StoreCourse UseCase テスト（API-009〜010）
 * 正常系 + 異常系をカバー
 */
describe('StoreCourseUseCase', () => {
  let useCase: StoreCourseUseCase;
  let courseRepo: {
    findPublicCourses: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findWithSections: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    courseRepo = {
      findPublicCourses: vi.fn(),
      findById: vi.fn(),
      findWithSections: vi.fn(),
    };

    useCase = new StoreCourseUseCase(
      courseRepo as unknown as StoreCourseRepository,
    );
  });

  describe('listPublicCourses (API-009)', () => {
    it('正常系: 公開講座一覧取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // courseRepo.findPublicCourses → [mockCourse]
      await expect(useCase.listPublicCourses()).rejects.toThrow('Not implemented');
    });

    it('正常系: フィルタ適用', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // style, category フィルタの検証
      await expect(useCase.listPublicCourses()).rejects.toThrow('Not implemented');
    });
  });

  describe('getCourseDetail (API-010)', () => {
    it('正常系: 講座詳細取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // courseRepo.findById → mockCourse (status=active)
      await expect(useCase.getCourseDetail('course-1')).rejects.toThrow('Not implemented');
    });

    it('異常系: 非公開講座で 404', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // courseRepo.findById → null or status≠active
      // NotFoundException を期待
      await expect(useCase.getCourseDetail('non-public')).rejects.toThrow('Not implemented');
    });
  });
});
