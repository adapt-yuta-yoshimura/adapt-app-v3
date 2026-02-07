import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';

import { CourseService } from '../services/course.service';
import {
  CourseListResponseDto,
  CourseDetailResponseDto,
} from '../dtos/course-response.dto';
import { CreateCourseDto, CreateCourseDtoSchema } from '../dtos/create-course.dto';
import { UpdateCourseDto, UpdateCourseDtoSchema } from '../dtos/update-course.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/services/jwt.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';

/**
 * 講師向けコースコントローラー
 *
 * エンドポイント:
 * - GET    /api/v1/instructor/courses           - 自講座一覧 (API-031)
 * - POST   /api/v1/instructor/courses           - 講座新規作成 (API-032)
 * - GET    /api/v1/instructor/courses/:id       - 講座詳細(管理) (API-033)
 * - PUT    /api/v1/instructor/courses/:id       - 講座情報更新 (API-034)
 * - DELETE /api/v1/instructor/courses/:id       - 講座削除(論理) (API-035)
 */
@Controller('api/v1/instructor/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstructorCourseController {
  private readonly logger = new Logger(InstructorCourseController.name);

  constructor(private readonly courseService: CourseService) {}

  /**
   * GET /api/v1/instructor/courses
   * 自分が管理・講師として参加している全講座を一覧取得する
   *
   * @operationId API_031
   * @roles instructor
   */
  @Get()
  async listMyCourses(
    @CurrentUser() user: JwtPayload,
  ): Promise<CourseListResponseDto> {
    return this.courseService.getMyCourses(user.sub);
  }

  /**
   * POST /api/v1/instructor/courses
   * 講座を新規作成する
   *
   * @operationId API_032
   * @roles instructor
   */
  @Post()
  async createCourse(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(CreateCourseDtoSchema)) dto: CreateCourseDto,
  ): Promise<CourseDetailResponseDto> {
    return this.courseService.createCourse(user.sub, dto);
  }

  /**
   * GET /api/v1/instructor/courses/:courseId
   * 講師用管理画面の講座詳細を取得する
   *
   * @operationId API_033
   * @roles instructor
   */
  @Get(':courseId')
  async getCourse(
    @CurrentUser() user: JwtPayload,
    @Param('courseId') courseId: string,
  ): Promise<CourseDetailResponseDto> {
    return this.courseService.getCourse(user.sub, courseId);
  }

  /**
   * PUT /api/v1/instructor/courses/:courseId
   * 講座情報を更新する（凍結時は423エラー）
   *
   * @operationId API_034
   * @roles instructor_owner
   */
  @Put(':courseId')
  async updateCourse(
    @CurrentUser() user: JwtPayload,
    @Param('courseId') courseId: string,
    @Body(new ZodValidationPipe(UpdateCourseDtoSchema)) dto: UpdateCourseDto,
  ): Promise<CourseDetailResponseDto> {
    return this.courseService.updateCourse(user.sub, courseId, dto);
  }

  /**
   * DELETE /api/v1/instructor/courses/:courseId
   * 講座を論理削除（archived）する
   *
   * @operationId API_035
   * @roles instructor_owner
   */
  @Delete(':courseId')
  async deleteCourse(
    @CurrentUser() user: JwtPayload,
    @Param('courseId') courseId: string,
  ): Promise<{ message: string }> {
    await this.courseService.deleteCourse(user.sub, courseId);
    return { message: 'Course deleted successfully' };
  }
}
