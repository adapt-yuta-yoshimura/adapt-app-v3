import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreUseCase } from './store.usecase';
import { StoreCourseRepository } from '../repositories/store-course.repository';

/**
 * STU-01: Store UseCase テスト（API-009〜010）
 * 正常系 + 異常系をカバー
 */
describe('StoreUseCase', () => {
  let useCase: StoreUseCase;
  let storeCourseRepo: {
    findActivePublic: ReturnType<typeof vi.fn>;
    findPublicById: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    storeCourseRepo = {
      findActivePublic: vi.fn(),
      findPublicById: vi.fn(),
    };

    useCase = new StoreUseCase(
      storeCourseRepo as unknown as StoreCourseRepository,
    );
  });

  describe('getStoreCourses (API-009)', () => {
    it('正常系: 公開講座一覧が返却される', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // storeCourseRepo.findActivePublic → [mockCourse]
      await expect(useCase.getStoreCourses()).rejects.toThrow('Not implemented');
    });

    it('正常系: 空一覧 - 該当なしで空 items + meta', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // storeCourseRepo.findActivePublic → []
      await expect(useCase.getStoreCourses()).rejects.toThrow('Not implemented');
    });

    it('正常系: style フィルター動作', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // style パラメータによるフィルタリング検証
      await expect(useCase.getStoreCourses()).rejects.toThrow('Not implemented');
    });
  });

  describe('getStoreCourseDetail (API-010)', () => {
    it('正常系: 講座詳細が返却される', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // storeCourseRepo.findPublicById → mockCourse (status=active)
      await expect(useCase.getStoreCourseDetail('course-1')).rejects.toThrow('Not implemented');
    });

    it('異常系: 404 - 存在しない courseId', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // storeCourseRepo.findPublicById → null
      // NotFoundException を期待
      await expect(useCase.getStoreCourseDetail('non-existent')).rejects.toThrow('Not implemented');
    });

    it('異常系: 404 - status が active でない講座', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // storeCourseRepo.findPublicById → null (status=draft)
      // NotFoundException を期待
      await expect(useCase.getStoreCourseDetail('draft-course')).rejects.toThrow('Not implemented');
    });
  });
});
