import { Module } from '@nestjs/common';
import { InstructorCourseModule } from '../instructor-course/instructor-course.module';
import { CommunicationModule } from '../communication/communication.module';
import { InstructorSubmissionController } from './instructor-submission.controller';
import { InstructorMemberController } from './instructor-member.controller';
import { InstructorSubmissionUseCase } from './instructor-submission.usecase';
import { InstructorMemberUseCase } from './instructor-member.usecase';
import { SubmissionRepository } from './submission.repository';
import { CourseMemberOpsRepository } from './course-member-ops.repository';

/**
 * 講師向け運営操作モジュール（提出物・受講者管理）
 *
 * INS-03チケット: API-043〜048
 * PrismaModule / AuthModule は @Global() のため imports 不要
 * InstructorCourseModule: CourseMemberRepository / CourseRepository を利用
 * CommunicationModule: MessageRepository / ThreadRepository を利用（THREAD_REPLY(AUTO)）
 */
@Module({
  imports: [InstructorCourseModule, CommunicationModule],
  controllers: [InstructorSubmissionController, InstructorMemberController],
  providers: [
    InstructorSubmissionUseCase,
    InstructorMemberUseCase,
    SubmissionRepository,
    CourseMemberOpsRepository,
  ],
})
export class InstructorOperationsModule {}
