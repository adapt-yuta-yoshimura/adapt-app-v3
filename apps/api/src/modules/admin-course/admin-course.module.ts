import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AdminUserModule } from '../admin-user/admin-user.module';
import { AdminCourseController } from './controllers/admin-course.controller';
import { AdminAuditController } from './controllers/admin-audit.controller';
import { AdminCourseUseCase } from './usecases/admin-course.usecase';
import { CourseRepository } from './repositories/course.repository';
import { CourseMemberRepository } from './repositories/course-member.repository';

@Module({
  imports: [AuditModule, AdminUserModule],
  controllers: [AdminCourseController, AdminAuditController],
  providers: [AdminCourseUseCase, CourseRepository, CourseMemberRepository],
})
export class AdminCourseModule {}
