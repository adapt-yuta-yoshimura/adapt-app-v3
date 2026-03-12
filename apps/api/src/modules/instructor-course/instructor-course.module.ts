import { Module } from '@nestjs/common';
import { InstructorCourseController } from './controllers/instructor-course.controller';
import { InstructorSyllabusController } from './controllers/instructor-syllabus.controller';
import { InstructorCourseUseCase } from './usecases/instructor-course.usecase';
import { SyllabusUseCase } from './usecases/syllabus.usecase';
import { CourseRepository } from './repositories/course.repository';
import { CourseSectionRepository } from './repositories/course-section.repository';
import { LessonRepository } from './repositories/lesson.repository';
import { CourseMemberRepository } from './repositories/course-member.repository';
import { CourseChannelRepository } from './repositories/course-channel.repository';
import { AuditModule } from '../audit/audit.module';

/**
 * 講師向け講座管理モジュール
 *
 * INS-01チケット: API-025〜031, API-034〜041
 * PrismaModule / AuthModule は @Global() のため imports 不要
 */
@Module({
  imports: [AuditModule],
  controllers: [InstructorCourseController, InstructorSyllabusController],
  providers: [
    InstructorCourseUseCase,
    SyllabusUseCase,
    CourseRepository,
    CourseSectionRepository,
    LessonRepository,
    CourseMemberRepository,
    CourseChannelRepository,
  ],
})
export class InstructorCourseModule {}
