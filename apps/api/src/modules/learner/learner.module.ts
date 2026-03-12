import { Module } from '@nestjs/common';
import { EnrollmentModule } from '../enrollment/enrollment.module';

// Controllers
import { LearnerCourseController } from './controllers/learner-course.controller';
import { LearnerEnrollmentController } from './controllers/learner-enrollment.controller';
import { LearnerAssignmentController } from './controllers/learner-assignment.controller';
import { LearnerRecordsController } from './controllers/learner-records.controller';
import { LearnerSurveyController } from './controllers/learner-survey.controller';

// Facade UseCases（既存: 非STU-02 API用）
import { LearnerCourseUseCase } from './usecases/learner-course.usecase';
import { LearnerEnrollmentUseCase } from './usecases/learner-enrollment.usecase';
import { LearnerAssignmentUseCase } from './usecases/learner-assignment.usecase';
import { LearnerRecordsUseCase } from './usecases/learner-records.usecase';
import { LearnerSurveyUseCase } from './usecases/learner-survey.usecase';

// Individual UseCases（STU-02: API-013〜015, 020, 022）
import { GetMyCoursesUseCase } from './usecases/get-my-courses.usecase';
import { GetCourseDetailUseCase } from './usecases/get-course-detail.usecase';
import { GetEnrollmentStatusUseCase } from './usecases/get-enrollment-status.usecase';
import { GetRecordsUseCase } from './usecases/get-records.usecase';
import { CompleteCourseUseCase } from './usecases/complete-course.usecase';

// Repositories
import { LearnerCourseRepository } from './repositories/learner-course.repository';
import { LearnerEnrollmentRepository } from './repositories/learner-enrollment.repository';
import { AssignmentRepository } from './repositories/assignment.repository';
import { SubmissionRepository } from './repositories/submission.repository';
import { SurveyRepository } from './repositories/survey.repository';
import { SurveyResponseRepository } from './repositories/survey-response.repository';

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
 * EnrollmentModule: CourseEnrollmentRepository を共用（Facade UseCase 用）
 */
@Module({
  imports: [EnrollmentModule],
  controllers: [
    LearnerCourseController,
    LearnerEnrollmentController,
    LearnerAssignmentController,
    LearnerRecordsController,
    LearnerSurveyController,
  ],
  providers: [
    // Facade UseCases（既存: 非STU-02 API用）
    LearnerCourseUseCase,
    LearnerEnrollmentUseCase,
    LearnerAssignmentUseCase,
    LearnerRecordsUseCase,
    LearnerSurveyUseCase,
    // Individual UseCases（STU-02: API-013〜015, 020, 022）
    GetMyCoursesUseCase,
    GetCourseDetailUseCase,
    GetEnrollmentStatusUseCase,
    GetRecordsUseCase,
    CompleteCourseUseCase,
    // Repositories
    LearnerCourseRepository,
    LearnerEnrollmentRepository,
    AssignmentRepository,
    SubmissionRepository,
    SurveyRepository,
    SurveyResponseRepository,
  ],
})
export class LearnerModule {}
