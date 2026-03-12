import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import type { Course, CourseChannel } from '@prisma/client';
import { CourseMemberRole, AuditEventType, GlobalRole } from '@prisma/client';
import type { paths } from '@adapt/types/openapi-app';
import { CourseRepository } from '../repositories/course.repository';
import { CourseMemberRepository } from '../repositories/course-member.repository';
import { CourseChannelRepository } from '../repositories/course-channel.repository';
import { AuditEventRepository } from '../../audit/repositories/audit-event.repository';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';

type CourseListResponse =
  paths['/api/v1/instructor/courses']['get']['responses']['200']['content']['application/json'];
type CourseDetailView =
  paths['/api/v1/instructor/courses/{courseId}']['get']['responses']['200']['content']['application/json'];
type InstructorCourseCreateRequest =
  paths['/api/v1/instructor/courses']['post']['requestBody']['content']['application/json'];
type CourseUpdateRequest =
  paths['/api/v1/instructor/courses/{courseId}']['put']['requestBody']['content']['application/json'];

/**
 * 講座管理ユースケース（講師）
 *
 * INS-01チケット: API-025〜031
 * Facade型 UseCase（既存モジュール方針に準拠）
 */
@Injectable()
export class InstructorCourseUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly memberRepo: CourseMemberRepository,
    private readonly channelRepo: CourseChannelRepository,
    private readonly auditEventRepo: AuditEventRepository,
  ) {}

  /** API-025: 自講座一覧 */
  async listCourses(userId: string): Promise<CourseListResponse> {
    const courses = await this.courseRepo.findByInstructor(userId);
    const courseIds = courses.map((c) => c.id);
    const countsMap =
      await this.courseRepo.findChannelAndMemberCounts(courseIds);

    const items = courses.map((course) => {
      const counts = countsMap.get(course.id) ?? {
        channelCount: 0,
        memberCount: 0,
      };
      return {
        course: this.toCourseSchema(course),
        channelCount: counts.channelCount,
        memberCount: counts.memberCount,
        isFrozen: course.isFrozen,
      };
    });

    return {
      items,
      meta: {
        page: { page: 1, pageSize: items.length, total: items.length },
        cursor: { nextCursor: null, hasMore: false },
      },
    };
  }

  /** API-026: 講座新規作成 */
  async createCourse(
    userId: string,
    data: InstructorCourseCreateRequest,
  ): Promise<CourseDetailView> {
    const course = await this.courseRepo.create({
      title: data.title,
      style: data.style,
      ownerUserId: userId,
      createdByUserId: userId,
      description: data.description ?? undefined,
      catalogVisibility: data.catalogVisibility ?? 'public_listed',
      visibility: data.visibility ?? 'public',
    });
    await this.memberRepo.create({
      courseId: course.id,
      userId,
      role: CourseMemberRole.instructor_owner,
    });
    return this.toCourseDetailView(course.id);
  }

  /** API-027: 講座詳細取得(管理) */
  async getCourse(userId: string, courseId: string): Promise<CourseDetailView> {
    const member = await this.memberRepo.findByUserAndCourse(userId, courseId);
    if (!member || !['instructor', 'instructor_owner'].includes(member.role)) {
      throw new ForbiddenException('Access denied');
    }
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return this.toCourseDetailView(courseId);
  }

  /**
   * API-028: 講座情報更新
   * x-policy: 423_ON_FROZEN
   */
  async updateCourse(
    userId: string,
    courseId: string,
    data: CourseUpdateRequest,
  ): Promise<CourseDetailView> {
    const member = await this.memberRepo.findByUserAndCourse(userId, courseId);
    if (!member || member.role !== CourseMemberRole.instructor_owner) {
      throw new ForbiddenException('Instructor owner role required');
    }
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.isFrozen) {
      throw new HttpException('Course is frozen', 423);
    }
    const updated = await this.courseRepo.update(courseId, {
      title: data.title,
      description: data.description,
      catalogVisibility: data.catalogVisibility,
      visibility: data.visibility,
      ownerUserId: data.ownerUserId,
    });
    return this.toCourseDetailView(updated.id);
  }

  /** API-029: 講座削除(論理) */
  async deleteCourse(
    userId: string,
    courseId: string,
  ): Promise<{ success: boolean; message?: string }> {
    const member = await this.memberRepo.findByUserAndCourse(userId, courseId);
    if (!member || member.role !== CourseMemberRole.instructor_owner) {
      throw new ForbiddenException('Instructor owner role required');
    }
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    await this.courseRepo.archive(courseId);
    return { success: true };
  }

  /**
   * API-030: 承認申請
   * x-policy: 423_ON_FROZEN
   */
  async requestApproval(
    userId: string,
    courseId: string,
  ): Promise<CourseDetailView> {
    const member = await this.memberRepo.findByUserAndCourse(userId, courseId);
    if (!member || member.role !== CourseMemberRole.instructor_owner) {
      throw new ForbiddenException('Instructor owner role required');
    }
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.isFrozen) {
      throw new HttpException('Course is frozen', 423);
    }
    await this.courseRepo.setStatusToPendingApproval(courseId);
    return this.toCourseDetailView(courseId);
  }

  /**
   * API-031: コース公開
   * x-policy: AUDIT_LOG
   * 403: ownerUserId不一致
   */
  async publishCourse(
    user: AuthenticatedUser,
    courseId: string,
  ): Promise<CourseDetailView> {
    const member = await this.memberRepo.findByUserAndCourse(
      user.userId,
      courseId,
    );
    if (!member || member.role !== CourseMemberRole.instructor_owner) {
      throw new ForbiddenException('Instructor owner role required');
    }
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.ownerUserId !== user.userId) {
      throw new ForbiddenException('Only the course owner can publish');
    }
    if (course.isFrozen) {
      throw new HttpException('Course is frozen', 423);
    }
    if (!course.approvedAt) {
      throw new BadRequestException(
        'Course must be approved before publishing',
      );
    }
    await this.courseRepo.setStatusToActive(courseId);

    await this.auditEventRepo.create({
      actorUserId: user.userId,
      eventType: AuditEventType.course_published,
      actorGlobalRole: user.globalRole as GlobalRole,
      reason: 'Instructor course publish',
      courseId,
      metaJson: {
        courseTitle: course.title,
        courseId,
        ownerUserId: course.ownerUserId,
      },
    });

    return this.toCourseDetailView(courseId);
  }

  private async toCourseDetailView(
    courseId: string,
  ): Promise<CourseDetailView> {
    const [course, channels, stats] = await Promise.all([
      this.courseRepo.findById(courseId),
      this.channelRepo.findManyByCourseId(courseId),
      this.courseRepo.findCourseStats(courseId),
    ]);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return {
      course: this.toCourseSchema(course),
      channels: channels.map((ch) => ({
        channel: this.toChannelSchema(ch),
        lastMessageAt: null,
        unreadCount: 0,
      })),
      stats: {
        learnerCount: stats.learnerCount,
        assignmentCount: stats.assignmentCount,
        lessonCount: stats.lessonCount,
        activeChannelCount: stats.activeChannelCount,
      },
    };
  }

  private toCourseSchema(course: Course): CourseDetailView['course'] {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      ownerUserId: course.ownerUserId,
      catalogVisibility: course.catalogVisibility,
      visibility: course.visibility,
      isFrozen: course.isFrozen,
      frozenAt: course.frozenAt?.toISOString() ?? null,
      frozenByUserId: course.frozenByUserId,
      freezeReason: course.freezeReason,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      createdByUserId: course.createdByUserId,
      status: course.status,
      style: course.style,
      approvalRequestedAt: course.approvalRequestedAt?.toISOString() ?? null,
      approvedAt: course.approvedAt?.toISOString() ?? null,
      approvedByUserId: course.approvedByUserId,
    };
  }

  private toChannelSchema(
    ch: CourseChannel,
  ): CourseDetailView['channels'][number]['channel'] {
    return {
      id: ch.id,
      courseId: ch.courseId,
      type: ch.type,
      postingMode: ch.postingMode,
      visibility: ch.visibility,
      isFrozen: ch.isFrozen,
      frozenAt: ch.frozenAt?.toISOString() ?? null,
      frozenByUserId: ch.frozenByUserId,
      freezeReason: ch.freezeReason,
      name: ch.name,
      isManual: ch.isManual,
      systemKey: ch.systemKey,
      createdAt: ch.createdAt.toISOString(),
      updatedAt: ch.updatedAt.toISOString(),
    };
  }
}
