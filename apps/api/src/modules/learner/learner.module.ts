import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module';
import { LearnerCourseController } from './learner-course.controller';
import { LearnerEnrollmentController } from './learner-enrollment.controller';
import { LearnerAssignmentController } from './learner-assignment.controller';
import { LearnerRecordsController } from './learner-records.controller';
import { LearnerSurveyController } from './learner-survey.controller';
import { LearnerCourseUseCase } from './learner-course.usecase';
import { LearnerEnrollmentUseCase } from './learner-enrollment.usecase';
import { LearnerAssignmentUseCase } from './learner-assignment.usecase';
import { LearnerRecordsUseCase } from './learner-records.usecase';
import { LearnerSurveyUseCase } from './learner-survey.usecase';
import { LearnerCourseRepository } from './learner-course.repository';
import { AssignmentRepository } from './assignment.repository';
import { SubmissionRepository } from './submission.repository';
import { SurveyRepository } from './survey.repository';
import { SurveyResponseRepository } from './survey-response.repository';

/**
 * Learner モジュール（受講者コア機能）
 *
 * STU系チケット: API-013〜024
 * - マイ講座一覧/詳細/サイドメニュー/修了
 * - 決済/申込状況確認
 * - 課題一覧/詳細/提出
 * - 学習実績/カレンダー
 * - アンケート取得/回答
 *
 * PrismaModule / AuthModule は @Global() のため imports 不要
 * StoreModule: EnrollmentRepository を共用
 */
@Module({
  imports: [StoreModule],
  controllers: [
    LearnerCourseController,
    LearnerEnrollmentController,
    LearnerAssignmentController,
    LearnerRecordsController,
    LearnerSurveyController,
  ],
  providers: [
    LearnerCourseUseCase,
    LearnerEnrollmentUseCase,
    LearnerAssignmentUseCase,
    LearnerRecordsUseCase,
    LearnerSurveyUseCase,
    LearnerCourseRepository,
    AssignmentRepository,
    SubmissionRepository,
    SurveyRepository,
    SurveyResponseRepository,
  ],
})
export class LearnerModule {}
