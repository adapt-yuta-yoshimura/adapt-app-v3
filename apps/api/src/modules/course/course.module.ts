import { Module } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

// Controllers
import { CourseController } from './controllers/course.controller';
import { InstructorCourseController } from './controllers/instructor-course.controller';

// Services
import { CourseService } from './services/course.service';

// Repositories
import { CourseRepository } from './repositories/course.repository';
import { CourseMemberRepository } from './repositories/course-member.repository';

/**
 * コースモジュール
 *
 * 提供する機能:
 * - 公開コース一覧・詳細（ストア向け）
 * - 講師向けコース管理（CRUD）
 * - コースメンバー管理
 *
 * エクスポート:
 * - CourseService: 他モジュールでコース操作に使用
 * - CourseRepository: 他モジュールでコースデータ取得に使用
 * - CourseMemberRepository: 他モジュールでメンバーデータ取得に使用
 */
@Module({
  imports: [AuthModule],
  controllers: [CourseController, InstructorCourseController],
  providers: [
    PrismaService,
    CourseService,
    CourseRepository,
    CourseMemberRepository,
  ],
  exports: [CourseService, CourseRepository, CourseMemberRepository],
})
export class CourseModule {}
