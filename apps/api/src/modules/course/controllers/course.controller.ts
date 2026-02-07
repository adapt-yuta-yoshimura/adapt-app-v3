import { Controller, Get, Param, Query, Logger } from '@nestjs/common';

import { CourseService } from '../services/course.service';
import {
  CourseListResponseDto,
  CourseDetailResponseDto,
} from '../dtos/course-response.dto';

/**
 * コースコントローラー（ストア / 公開アクセス）
 *
 * エンドポイント:
 * - GET /api/v1/store/courses       - 公開講座一覧 (API-015)
 * - GET /api/v1/store/courses/:id   - 講座詳細 (API-016)
 */
@Controller('api/v1/store/courses')
export class CourseController {
  private readonly logger = new Logger(CourseController.name);

  constructor(private readonly courseService: CourseService) {}

  /**
   * GET /api/v1/store/courses
   * 公開中の講座一覧を取得する（カタログ掲載あり）
   *
   * @operationId API_015
   * @roles guest, all
   */
  @Get()
  async listPublicCourses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<CourseListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    return this.courseService.getPublicCourses(pageNum, limitNum);
  }

  /**
   * GET /api/v1/store/courses/:courseId
   * 公開講座の詳細を取得する（LP向け）
   *
   * @operationId API_016
   * @roles guest, all
   */
  @Get(':courseId')
  async getCourseDetail(
    @Param('courseId') courseId: string,
  ): Promise<CourseDetailResponseDto> {
    return this.courseService.getPublicCourseDetail(courseId);
  }
}
