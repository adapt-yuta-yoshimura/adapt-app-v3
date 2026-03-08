import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuditEventType, GlobalRole } from '@prisma/client';
import type { Course, User } from '@prisma/client';
import { AdminCourseUseCase } from '../usecases/admin-course.usecase';
import { CourseRepository } from '../repositories/course.repository';
import { CourseMemberRepository } from '../repositories/course-member.repository';
import { AuditEventRepository } from '../../audit/repositories/audit-event.repository';
import { UserRepository } from '../../admin-user/repositories/user.repository';

/**
 * ADMIN-04: 講座管理 UseCase テスト
 *
 * SoT: openapi_admin.yaml - API-ADMIN-01〜08
 * SoT: schema.prisma - Course, CourseMember, AuditEvent
 */
describe('AdminCourseUseCase', () => {
  let useCase: AdminCourseUseCase;
  let courseRepo: {
    findMany: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    archive: ReturnType<typeof vi.fn>;
    approve: ReturnType<typeof vi.fn>;
    freeze: ReturnType<typeof vi.fn>;
    unfreeze: ReturnType<typeof vi.fn>;
  };
  let courseMemberRepo: { create: ReturnType<typeof vi.fn> };
  let auditRepo: {
    create: ReturnType<typeof vi.fn>;
    findByCourseId: ReturnType<typeof vi.fn>;
  };
  let userRepo: { findById: ReturnType<typeof vi.fn> };

  const actorUserId = 'actor-op-1';
  const actorGlobalRole = GlobalRole.operator;

  const mockCourse: Course = {
    id: 'course-1',
    title: 'Test Course',
    description: null,
    ownerUserId: 'owner-instructor-1',
    createdByUserId: actorUserId,
    status: 'draft',
    style: 'seminar',
    approvalRequestedAt: null,
    approvedAt: null,
    approvedByUserId: null,
    isFrozen: false,
    frozenAt: null,
    frozenByUserId: null,
    freezeReason: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    catalogVisibility: 'public_listed',
    visibility: 'public',
  };

  const mockInstructor: User = {
    id: 'owner-instructor-1',
    email: 'inst@example.com',
    name: 'Instructor',
    globalRole: 'instructor',
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    courseRepo = {
      findMany: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      approve: vi.fn(),
      freeze: vi.fn(),
      unfreeze: vi.fn(),
    };
    courseMemberRepo = { create: vi.fn() };
    auditRepo = {
      create: vi.fn().mockResolvedValue(undefined),
      findByCourseId: vi.fn().mockResolvedValue([]),
    };
    userRepo = { findById: vi.fn() };
    useCase = new AdminCourseUseCase(
      courseRepo as unknown as CourseRepository,
      courseMemberRepo as unknown as CourseMemberRepository,
      auditRepo as unknown as AuditEventRepository,
      userRepo as unknown as UserRepository,
    );
  });

  describe('listCourses', () => {
    it('operator → 200: CourseListResponse を返す', async () => {
      courseRepo.findMany.mockResolvedValue({
        items: [mockCourse],
        totalCount: 1,
      });

      const result = await useCase.listCourses({ page: 1, perPage: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('course-1');
      expect(result.items[0].title).toBe('Test Course');
      expect(result.items[0].status).toBe('draft');
      expect(result.meta).toEqual({
        totalCount: 1,
        page: 1,
        perPage: 20,
        totalPages: 1,
      });
      expect(courseRepo.findMany).toHaveBeenCalledWith({
        page: 1,
        perPage: 20,
      });
    });

    it('root_operator → 200: CourseListResponse を返す', async () => {
      courseRepo.findMany.mockResolvedValue({ items: [], totalCount: 0 });

      const result = await useCase.listCourses();

      expect(result.items).toEqual([]);
      expect(result.meta.totalCount).toBe(0);
    });
  });

  describe('createCourse', () => {
    it('operator + 正常 → 201: Course を返す（status=draft）', async () => {
      userRepo.findById.mockResolvedValue(mockInstructor);
      courseRepo.create.mockResolvedValue(mockCourse);

      const result = await useCase.createCourse(
        actorUserId,
        actorGlobalRole,
        {
          title: 'New Course',
          style: 'seminar',
          ownerUserId: 'owner-instructor-1',
        },
      );

      expect(result.id).toBe('course-1');
      expect(result.status).toBe('draft');
      expect(result.createdByUserId).toBe(actorUserId);
      expect(courseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Course',
          style: 'seminar',
          ownerUserId: 'owner-instructor-1',
          createdByUserId: actorUserId,
        }),
      );
    });

    it('CourseMember（role=instructor）が作成される', async () => {
      userRepo.findById.mockResolvedValue(mockInstructor);
      courseRepo.create.mockResolvedValue(mockCourse);

      await useCase.createCourse(actorUserId, actorGlobalRole, {
        title: 'New',
        style: 'lecture',
        ownerUserId: 'owner-instructor-1',
      });

      expect(courseMemberRepo.create).toHaveBeenCalledWith({
        courseId: 'course-1',
        userId: 'owner-instructor-1',
        role: 'instructor',
      });
    });

    it('AuditEvent（course_created）が記録される', async () => {
      userRepo.findById.mockResolvedValue(mockInstructor);
      courseRepo.create.mockResolvedValue(mockCourse);

      await useCase.createCourse(actorUserId, actorGlobalRole, {
        title: 'New',
        style: 'bootcamp',
        ownerUserId: 'owner-instructor-1',
      });

      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId,
          eventType: AuditEventType.course_created,
          actorGlobalRole: GlobalRole.operator,
          courseId: 'course-1',
          metaJson: expect.objectContaining({
            courseTitle: 'Test Course',
            courseStatus: 'draft',
            ownerUserId: 'owner-instructor-1',
            title: 'Test Course',
            style: 'seminar',
          }),
        }),
      );
    });

    it('ownerUserId が存在しない → 400 BadRequestException', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.createCourse(actorUserId, actorGlobalRole, {
          title: 'New',
          style: 'seminar',
          ownerUserId: 'non-existent',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(courseRepo.create).not.toHaveBeenCalled();
    });

    it('ownerUserId が instructor でない → 400 BadRequestException', async () => {
      userRepo.findById.mockResolvedValue({
        ...mockInstructor,
        globalRole: 'learner',
      });

      await expect(
        useCase.createCourse(actorUserId, actorGlobalRole, {
          title: 'New',
          style: 'seminar',
          ownerUserId: 'owner-instructor-1',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(courseRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateCourse', () => {
    it('operator + 正常 → 200: CourseDetailView を返す', async () => {
      const updated = { ...mockCourse, title: 'Updated Title' };
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.update.mockResolvedValue(updated);

      const result = await useCase.updateCourse(
        actorUserId,
        actorGlobalRole,
        'course-1',
        { title: 'Updated Title' },
      );

      expect(result.title).toBe('Updated Title');
      expect(courseRepo.update).toHaveBeenCalledWith('course-1', {
        title: 'Updated Title',
      });
    });

    it('存在しない courseId → 404 NotFoundException', async () => {
      courseRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.updateCourse(actorUserId, actorGlobalRole, 'nonexistent', {
          title: 'X',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(courseRepo.update).not.toHaveBeenCalled();
    });

    it('AuditEvent（course_updated）が記録される', async () => {
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.update.mockResolvedValue(mockCourse);

      await useCase.updateCourse(actorUserId, actorGlobalRole, 'course-1', {
        description: 'New desc',
      });

      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId,
          eventType: AuditEventType.course_updated,
          actorGlobalRole: GlobalRole.operator,
          courseId: 'course-1',
          metaJson: expect.objectContaining({
            courseTitle: 'Test Course',
            courseStatus: 'draft',
            ownerUserId: 'owner-instructor-1',
            changedFields: ['description'],
          }),
        }),
      );
    });
  });

  describe('deleteCourse', () => {
    it('operator → 200: SuccessResponse を返す', async () => {
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.archive.mockResolvedValue({ ...mockCourse, status: 'archived' });

      const result = await useCase.deleteCourse(
        actorUserId,
        actorGlobalRole,
        'course-1',
      );

      expect(result.success).toBe(true);
      expect(courseRepo.archive).toHaveBeenCalledWith('course-1');
    });

    it('削除後: status = archived', async () => {
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.archive.mockResolvedValue({ ...mockCourse, status: 'archived' });

      await useCase.deleteCourse(actorUserId, actorGlobalRole, 'course-1');

      expect(courseRepo.archive).toHaveBeenCalledWith('course-1');
    });

    it('存在しない courseId → 404 NotFoundException', async () => {
      courseRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.deleteCourse(actorUserId, actorGlobalRole, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);

      expect(courseRepo.archive).not.toHaveBeenCalled();
    });

    it('AuditEvent（course_archived）が記録される', async () => {
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.archive.mockResolvedValue(mockCourse);

      await useCase.deleteCourse(actorUserId, actorGlobalRole, 'course-1');

      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId,
          eventType: AuditEventType.course_archived,
          actorGlobalRole: GlobalRole.operator,
          courseId: 'course-1',
          metaJson: expect.objectContaining({
            courseTitle: 'Test Course',
            courseStatus: 'draft',
            ownerUserId: 'owner-instructor-1',
            title: 'Test Course',
            previousStatus: 'draft',
          }),
        }),
      );
    });
  });

  describe('approveCourse', () => {
    it('operator + pending_approval → 201: status=active', async () => {
      const pending = { ...mockCourse, status: 'pending_approval' as const };
      const approved = {
        ...mockCourse,
        status: 'active' as const,
        approvedAt: new Date(),
        approvedByUserId: actorUserId,
      };
      courseRepo.findById.mockResolvedValue(pending);
      courseRepo.approve.mockResolvedValue(approved);

      const result = await useCase.approveCourse(
        actorUserId,
        actorGlobalRole,
        'course-1',
      );

      expect(result.status).toBe('active');
      expect(courseRepo.approve).toHaveBeenCalledWith('course-1', actorUserId);
    });

    it('AuditEvent（course_approved）が記録される', async () => {
      const pending = { ...mockCourse, status: 'pending_approval' as const };
      courseRepo.findById.mockResolvedValue(pending);
      courseRepo.approve.mockResolvedValue({
        ...mockCourse,
        status: 'active',
        approvedAt: new Date(),
        approvedByUserId: actorUserId,
      });

      await useCase.approveCourse(actorUserId, actorGlobalRole, 'course-1');

      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId,
          eventType: AuditEventType.course_approved,
          actorGlobalRole: GlobalRole.operator,
          courseId: 'course-1',
          metaJson: expect.objectContaining({
            courseTitle: 'Test Course',
            courseStatus: 'active',
            ownerUserId: 'owner-instructor-1',
            title: 'Test Course',
          }),
        }),
      );
    });

    it('status が pending_approval でない → 400 BadRequestException', async () => {
      courseRepo.findById.mockResolvedValue(mockCourse);

      await expect(
        useCase.approveCourse(actorUserId, actorGlobalRole, 'course-1'),
      ).rejects.toThrow(BadRequestException);

      expect(courseRepo.approve).not.toHaveBeenCalled();
    });
  });

  describe('freezeCourse', () => {
    it('operator → 201: isFrozen=true', async () => {
      const frozen = {
        ...mockCourse,
        isFrozen: true,
        frozenAt: new Date(),
        frozenByUserId: actorUserId,
      };
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.freeze.mockResolvedValue(frozen);

      const result = await useCase.freezeCourse(
        actorUserId,
        actorGlobalRole,
        'course-1',
        { reason: 'Policy violation' },
      );

      expect(result.isFrozen).toBe(true);
      expect(courseRepo.freeze).toHaveBeenCalledWith(
        'course-1',
        actorUserId,
        'Policy violation',
      );
    });

    it('AuditEvent（course_frozen）が記録される', async () => {
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.freeze.mockResolvedValue({
        ...mockCourse,
        isFrozen: true,
        frozenAt: new Date(),
        frozenByUserId: actorUserId,
      });

      await useCase.freezeCourse(actorUserId, actorGlobalRole, 'course-1', {
        reason: 'Test',
      });

      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId,
          eventType: AuditEventType.course_frozen,
          actorGlobalRole: GlobalRole.operator,
          courseId: 'course-1',
          metaJson: expect.objectContaining({
            courseTitle: 'Test Course',
            courseStatus: 'draft',
            ownerUserId: 'owner-instructor-1',
            title: 'Test Course',
            reason: 'Test',
          }),
        }),
      );
    });

    it('存在しない courseId → 404 NotFoundException', async () => {
      courseRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.freezeCourse(actorUserId, actorGlobalRole, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unfreezeCourse', () => {
    it('root_operator → 201: isFrozen=false', async () => {
      const frozen = {
        ...mockCourse,
        isFrozen: true,
        frozenAt: new Date(),
        frozenByUserId: 'root-1',
      };
      const unfrozen = {
        ...mockCourse,
        isFrozen: false,
        frozenAt: null,
        frozenByUserId: null,
        freezeReason: null,
      };
      courseRepo.findById.mockResolvedValue(frozen);
      courseRepo.unfreeze.mockResolvedValue(unfrozen);

      const result = await useCase.unfreezeCourse('root-1', 'course-1');

      expect(result.isFrozen).toBe(false);
      expect(courseRepo.unfreeze).toHaveBeenCalledWith('course-1');
      expect(auditRepo.create).not.toHaveBeenCalled();
    });

    it('凍結されていない講座でも unfreeze は成功する', async () => {
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.unfreeze.mockResolvedValue({
        ...mockCourse,
        isFrozen: false,
        frozenAt: null,
        frozenByUserId: null,
        freezeReason: null,
      });

      const result = await useCase.unfreezeCourse(actorUserId, 'course-1');

      expect(result.isFrozen).toBe(false);
    });

    it('存在しない courseId → 404 NotFoundException', async () => {
      courseRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.unfreezeCourse(actorUserId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('auditCourse', () => {
    it('operator → 200: GenericDetailView を返す', async () => {
      courseRepo.findById.mockResolvedValue(mockCourse);
      auditRepo.findByCourseId.mockResolvedValue([]);

      const result = await useCase.auditCourse(
        actorUserId,
        actorGlobalRole,
        'course-1',
      );

      expect(result.course.id).toBe('course-1');
      expect(result.auditEvents).toEqual([]);
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId,
          eventType: AuditEventType.frozen_course_viewed,
          actorGlobalRole: GlobalRole.operator,
          courseId: 'course-1',
          metaJson: expect.objectContaining({
            courseTitle: 'Test Course',
            courseStatus: 'draft',
            ownerUserId: 'owner-instructor-1',
            title: 'Test Course',
          }),
        }),
      );
    });

    it('AuditEvent（frozen_course_viewed）が強制記録される', async () => {
      courseRepo.findById.mockResolvedValue(mockCourse);
      auditRepo.findByCourseId.mockResolvedValue([]);

      await useCase.auditCourse(actorUserId, actorGlobalRole, 'course-1');

      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEventType.frozen_course_viewed,
          courseId: 'course-1',
        }),
      );
    });

    it('存在しない courseId → 404 NotFoundException', async () => {
      courseRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.auditCourse(actorUserId, actorGlobalRole, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);

      expect(auditRepo.create).not.toHaveBeenCalled();
    });
  });
});
