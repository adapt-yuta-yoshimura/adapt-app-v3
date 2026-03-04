import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { Course } from '@prisma/client';
import {
  CourseCatalogVisibility,
  CourseMemberRole,
  CourseStatus,
  CourseStyle,
  CourseVisibility,
  GlobalRole,
} from '@prisma/client';
import { AuditEventType } from '@prisma/client';
import { CourseRepository } from '../repositories/course.repository';
import { CourseMemberRepository } from '../repositories/course-member.repository';
import { AuditEventRepository } from '../../audit/repositories/audit-event.repository';
import { UserRepository } from '../../admin-user/repositories/user.repository';

/** SoT: openapi_admin.yaml - Course */
export type CourseResponse = {
  id: string;
  title: string;
  description: string | null;
  ownerUserId: string;
  catalogVisibility: CourseCatalogVisibility;
  visibility: CourseVisibility;
  isFrozen: boolean;
  frozenAt: string | null;
  frozenByUserId: string | null;
  freezeReason: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  status: CourseStatus;
  style: CourseStyle;
  approvalRequestedAt: string | null;
  approvedAt: string | null;
  approvedByUserId: string | null;
};

/** SoT: openapi_admin.yaml - CourseListResponse */
export type CourseListResponse = {
  items: CourseResponse[];
  meta: {
    totalCount: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
};

/** SoT: openapi_admin.yaml - SuccessResponse */
export type SuccessResponse = { success: boolean; message?: string };

/** SoT: openapi_admin.yaml - GenericDetailView（監査閲覧用） */
export type GenericDetailView = {
  course: CourseResponse;
  auditEvents: Array<{
    id: string;
    occurredAt: string;
    actorUserId: string;
    eventType: string;
    reason: string;
    metaJson: unknown;
  }>;
};

/**
 * 講座管理ユースケース（Admin）
 *
 * ADMIN-04チケット: 講座の一覧、代理作成、承認、凍結/解除、削除、監査閲覧
 */
@Injectable()
export class AdminCourseUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly courseMemberRepo: CourseMemberRepository,
    private readonly auditEventRepo: AuditEventRepository,
    private readonly userRepo: UserRepository,
  ) {}

  private toCourseResponse(course: Course): CourseResponse {
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

  /**
   * API-ADMIN-01: 全講座一覧
   */
  async listCourses(params?: {
    page?: number;
    perPage?: number;
    status?: CourseStatus;
    style?: CourseStyle;
    titleSearch?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status';
    sortOrder?: 'asc' | 'desc';
  }): Promise<CourseListResponse> {
    const result = await this.courseRepo.findMany(params);
    const perPage = Math.min(100, Math.max(1, params?.perPage ?? 20));
    const page = Math.max(1, params?.page ?? 1);
    const totalPages = Math.ceil(result.totalCount / perPage);
    return {
      items: result.items.map((c) => this.toCourseResponse(c)),
      meta: {
        totalCount: result.totalCount,
        page,
        perPage,
        totalPages,
      },
    };
  }

  /**
   * API-ADMIN-02: 講座代理作成（運営）
   * - ownerUserId の User が instructor であることを確認
   * - status=draft, CourseMember(role=instructor) 作成, AUDIT_LOG
   */
  async createCourse(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    params: {
      title: string;
      style: CourseStyle;
      ownerUserId: string;
      description?: string | null;
      catalogVisibility?: CourseCatalogVisibility;
      visibility?: CourseVisibility;
    },
  ): Promise<CourseResponse> {
    const owner = await this.userRepo.findById(params.ownerUserId);
    if (!owner) {
      throw new BadRequestException('ownerUserId: User not found');
    }
    if (owner.globalRole !== 'instructor') {
      throw new BadRequestException(
        'ownerUserId: User must have globalRole instructor',
      );
    }

    const course = await this.courseRepo.create({
      title: params.title,
      style: params.style,
      ownerUserId: params.ownerUserId,
      createdByUserId: actorUserId,
      description: params.description,
      catalogVisibility: params.catalogVisibility,
      visibility: params.visibility,
    });

    await this.courseMemberRepo.create({
      courseId: course.id,
      userId: params.ownerUserId,
      role: CourseMemberRole.instructor,
    });

    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.course_created,
      actorGlobalRole,
      reason: 'Admin course create',
      courseId: course.id,
      metaJson: {
        title: course.title,
        ownerUserId: course.ownerUserId,
        style: course.style,
      },
    });

    return this.toCourseResponse(course);
  }

  /**
   * API-ADMIN-03: 講座代理編集（運営）
   */
  async updateCourse(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    courseId: string,
    params: {
      title?: string;
      description?: string | null;
      catalogVisibility?: CourseCatalogVisibility;
      visibility?: CourseVisibility;
      ownerUserId?: string;
    },
  ): Promise<CourseResponse> {
    const existing = await this.courseRepo.findById(courseId);
    if (!existing) {
      throw new NotFoundException('Course not found');
    }

    const changedFields: string[] = [];
    if (params.title !== undefined && params.title !== existing.title)
      changedFields.push('title');
    if (
      params.description !== undefined &&
      params.description !== existing.description
    )
      changedFields.push('description');
    if (
      params.catalogVisibility !== undefined &&
      params.catalogVisibility !== existing.catalogVisibility
    )
      changedFields.push('catalogVisibility');
    if (
      params.visibility !== undefined &&
      params.visibility !== existing.visibility
    )
      changedFields.push('visibility');
    if (
      params.ownerUserId !== undefined &&
      params.ownerUserId !== existing.ownerUserId
    )
      changedFields.push('ownerUserId');

    const course = await this.courseRepo.update(courseId, params);

    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.course_updated,
      actorGlobalRole,
      reason: 'Admin course update',
      courseId,
      metaJson: { changedFields },
    });

    return this.toCourseResponse(course);
  }

  /**
   * API-ADMIN-04: 講座削除（論理削除 = archived）
   */
  async deleteCourse(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    courseId: string,
  ): Promise<SuccessResponse> {
    const existing = await this.courseRepo.findById(courseId);
    if (!existing) {
      throw new NotFoundException('Course not found');
    }

    await this.courseRepo.archive(courseId);

    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.course_archived,
      actorGlobalRole,
      reason: 'Admin course archive',
      courseId,
      metaJson: { title: existing.title, previousStatus: existing.status },
    });

    return { success: true };
  }

  /**
   * API-ADMIN-05: 講座承認・審査
   */
  async approveCourse(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    courseId: string,
  ): Promise<CourseResponse> {
    const existing = await this.courseRepo.findById(courseId);
    if (!existing) {
      throw new NotFoundException('Course not found');
    }
    if (existing.status !== 'pending_approval') {
      throw new BadRequestException(
        'Course status must be pending_approval to approve',
      );
    }

    const course = await this.courseRepo.approve(courseId, actorUserId);

    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.course_approved,
      actorGlobalRole,
      reason: 'Admin course approve',
      courseId,
      metaJson: { title: course.title },
    });

    return this.toCourseResponse(course);
  }

  /**
   * API-ADMIN-06: コース凍結（運営）
   */
  async freezeCourse(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    courseId: string,
    body?: { reason?: string },
  ): Promise<CourseResponse> {
    const existing = await this.courseRepo.findById(courseId);
    if (!existing) {
      throw new NotFoundException('Course not found');
    }

    const course = await this.courseRepo.freeze(
      courseId,
      actorUserId,
      body?.reason ?? null,
    );

    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.course_frozen,
      actorGlobalRole,
      reason: 'Admin course freeze',
      courseId,
      metaJson: { title: course.title, reason: body?.reason ?? null },
    });

    return this.toCourseResponse(course);
  }

  /**
   * API-ADMIN-07: コース凍結解除（root_operator のみ・監査ログなし）
   */
  async unfreezeCourse(actorUserId: string, courseId: string): Promise<CourseResponse> {
    const existing = await this.courseRepo.findById(courseId);
    if (!existing) {
      throw new NotFoundException('Course not found');
    }

    const course = await this.courseRepo.unfreeze(courseId);
    return this.toCourseResponse(course);
  }

  /**
   * API-ADMIN-08: [監査]凍結講座閲覧（閲覧ログ強制記録）
   */
  async auditCourse(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    courseId: string,
  ): Promise<GenericDetailView> {
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.frozen_course_viewed,
      actorGlobalRole,
      reason: 'Frozen course audit view',
      courseId,
      metaJson: { title: course.title },
    });

    const auditEvents = await this.auditEventRepo.findByCourseId(courseId);
    return {
      course: this.toCourseResponse(course),
      auditEvents: auditEvents.map((e) => ({
        id: e.id,
        occurredAt: e.occurredAt.toISOString(),
        actorUserId: e.actorUserId,
        eventType: e.eventType,
        reason: e.reason,
        metaJson: e.metaJson,
      })),
    };
  }
}
