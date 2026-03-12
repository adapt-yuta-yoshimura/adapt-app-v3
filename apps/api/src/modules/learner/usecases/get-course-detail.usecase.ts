import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { LearnerCourseRepository } from '../repositories/learner-course.repository';
import { LearnerEnrollmentRepository } from '../repositories/learner-enrollment.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type GetLearnerCourseDetailResponse =
  paths['/api/v1/learner/courses/{courseId}']['get']['responses']['200']['content']['application/json'];

/**
 * API-014: 受講中講座詳細 UseCase
 *
 * x-roles: learner, instructor
 * x-policy: 423_ON_FROZEN
 *
 * LearnerCourseDetailView:
 *   course: Course
 *   channels: CourseChannelSummaryView[]
 *   stats: CourseStatsView
 *   syllabus: SyllabusView
 */
@Injectable()
export class GetCourseDetailUseCase {
  constructor(
    private readonly learnerCourseRepo: LearnerCourseRepository,
    private readonly learnerEnrollmentRepo: LearnerEnrollmentRepository,
  ) {}

  async execute(userId: string, courseId: string): Promise<GetLearnerCourseDetailResponse> {
    // TODO(TBD): Cursor実装
    // 1. enrolled 確認（learnerEnrollmentRepo.findByUserAndCourse）→ 404（未受講 or 不存在）
    // 2. 凍結チェック（x-policy: 423_ON_FROZEN）→ 423
    // 3. 講座詳細取得（learnerCourseRepo.findByIdWithRelations）
    //    - Course
    //    - CourseChannel[] → CourseChannelSummaryView[] 変換
    //      - unreadCount: 既読管理の具体実装に依存。暫定で 0 を返すか TODO(TBD)
    //    - stats 集計（learnerCount, assignmentCount, lessonCount, activeChannelCount）
    //      - Prisma の _count で集計
    //    - CourseSection/Lesson → SyllabusView 変換
    //      - 1on1/セミナー: sections 空配列
    //      - BC: sections に Lesson を含む
    // 4. LearnerCourseDetailView を返却
    throw new Error('Not implemented');
  }
}
