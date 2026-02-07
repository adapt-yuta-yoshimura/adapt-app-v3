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
  ForbiddenException,
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
import { ValidatedUser } from '../../auth/strategies/jwt.strategy';
import { AuthService } from '../../auth/services/auth.service';
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

  constructor(
    private readonly courseService: CourseService,
    private readonly authService: AuthService,
  ) {}

  /**
   * GET /api/v1/instructor/courses
   * 自分が管理・講師として参加している全講座を一覧取得する
   *
   * @operationId API_031
   * @roles instructor
   */
  @Get()
  async listMyCourses(
    @CurrentUser() user: ValidatedUser,
  ): Promise<CourseListResponseDto> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    return this.courseService.getMyCourses(dbUser.id);
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
    @CurrentUser() user: ValidatedUser,
    @Body(new ZodValidationPipe(CreateCourseDtoSchema)) dto: CreateCourseDto,
  ): Promise<CourseDetailResponseDto> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    return this.courseService.createCourse(dbUser.id, dto);
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
    @CurrentUser() user: ValidatedUser,
    @Param('courseId') courseId: string,
  ): Promise<CourseDetailResponseDto> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    return this.courseService.getCourse(dbUser.id, courseId);
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
    @CurrentUser() user: ValidatedUser,
    @Param('courseId') courseId: string,
    @Body(new ZodValidationPipe(UpdateCourseDtoSchema)) dto: UpdateCourseDto,
  ): Promise<CourseDetailResponseDto> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    return this.courseService.updateCourse(dbUser.id, courseId, dto);
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
    @CurrentUser() user: ValidatedUser,
    @Param('courseId') courseId: string,
  ): Promise<{ message: string }> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    await this.courseService.deleteCourse(dbUser.id, courseId);
    return { message: 'Course deleted successfully' };
  }
}
