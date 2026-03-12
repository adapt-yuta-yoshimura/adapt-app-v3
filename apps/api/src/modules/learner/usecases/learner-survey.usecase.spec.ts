import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LearnerSurveyUseCase } from './learner-survey.usecase';
import { SurveyRepository } from '../repositories/survey.repository';
import { SurveyResponseRepository } from '../repositories/survey-response.repository';

/**
 * STU: LearnerSurvey UseCase テスト（API-023〜024）
 * 正常系 + 重複回答409 + 凍結423をカバー
 */
describe('LearnerSurveyUseCase', () => {
  let useCase: LearnerSurveyUseCase;
  let surveyRepo: {
    findById: ReturnType<typeof vi.fn>;
    findWithQuestions: ReturnType<typeof vi.fn>;
  };
  let responseRepo: {
    findBySurveyAndUser: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    createAnswer: ReturnType<typeof vi.fn>;
    createAnswerOption: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-learner-1';
  const surveyId = 'survey-1';

  beforeEach(() => {
    vi.clearAllMocks();
    surveyRepo = {
      findById: vi.fn(),
      findWithQuestions: vi.fn(),
    };
    responseRepo = {
      findBySurveyAndUser: vi.fn(),
      create: vi.fn(),
      createAnswer: vi.fn(),
      createAnswerOption: vi.fn(),
    };

    useCase = new LearnerSurveyUseCase(
      surveyRepo as unknown as SurveyRepository,
      responseRepo as unknown as SurveyResponseRepository,
    );
  });

  describe('getSurvey (API-023)', () => {
    it('正常系: アンケート取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // surveyRepo.findWithQuestions → mockSurvey
      await expect(useCase.getSurvey(surveyId)).rejects.toThrow('Not implemented');
    });
  });

  describe('submitResponse (API-024)', () => {
    it('正常系: アンケート回答', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // responseRepo.findBySurveyAndUser → null（重複なし）
      // responseRepo.create → mockResponse
      await expect(
        useCase.submitResponse(surveyId, userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 重複回答で 409', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // responseRepo.findBySurveyAndUser → 既存Response
      // ConflictException(409) を期待
      await expect(
        useCase.submitResponse(surveyId, userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 凍結講座で 423', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // surveyRepo.findById → { courseId → Course.isFrozen=true }
      // HttpException(423) を期待
      await expect(
        useCase.submitResponse('frozen-survey', userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });
  });
});
