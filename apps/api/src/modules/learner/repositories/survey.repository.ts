import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * Survey リポジトリ
 *
 * Survey, SurveyQuestion, SurveyOption テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - Survey, SurveyQuestion, SurveyOption model
 */
@Injectable()
export class SurveyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(surveyId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findWithQuestions(surveyId: string) {
    // TODO(TBD): Cursor実装
    // Survey + SurveyQuestion + SurveyOption を order 順で取得
    throw new Error('Not implemented');
  }
}
