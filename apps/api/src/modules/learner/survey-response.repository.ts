import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * SurveyResponse リポジトリ
 *
 * SurveyResponse, SurveyAnswer, SurveyAnswerOption テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - SurveyResponse, SurveyAnswer, SurveyAnswerOption model
 * @@unique([surveyId, userId])
 */
@Injectable()
export class SurveyResponseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySurveyAndUser(surveyId: string, userId: string) {
    // TODO(TBD): Cursor実装
    // 重複回答チェック用
    throw new Error('Not implemented');
  }

  async create(data: { surveyId: string; userId: string }) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async createAnswer(data: { responseId: string; questionId: string; valueText?: string; valueNumber?: number }) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async createAnswerOption(data: { answerId: string; optionId: string }) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
