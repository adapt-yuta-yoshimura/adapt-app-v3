import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ForbiddenException,
  NotFoundException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { CourseMemberRole } from '@prisma/client';
import type { Course, CourseMember } from '@prisma/client';
import { InstructorCourseUseCase } from '../instructor-course.usecase';
import { CourseRepository } from '../../repositories/course.repository';
import { CourseMemberRepository } from '../../repositories/course-member.repository';
import { CourseChannelRepository } from '../../repositories/course-channel.repository';
import { AuditEventRepository } from '../../../audit/repositories/audit-event.repository';
import type { CourseStats } from '../../repositories/course.repository';
import type { AuthenticatedUser } from '../../../../common/auth/jwt.types';

/**
 * INS-01: 講座管理 UseCase テスト（API-025〜031）
 * 正常系・権限NG（403）・凍結423・AUDIT_LOG をカバー
 */
describe('InstructorCourseUseCase', () => {
  let useCase: InstructorCourseUseCase;
  let courseRepo: {
    findByInstructor: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    archive: ReturnType<typeof vi.fn>;
    setStatusToPendingApproval: ReturnType<typeof vi.fn>;
    setStatusToActive: ReturnType<typeof vi.fn>;
    findCourseStats: ReturnType<typeof vi.fn>;
    findChannelAndMemberCounts: ReturnType<typeof vi.fn>;
  };
  let memberRepo: {
    findByUserAndCourse: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let channelRepo: { findManyByCourseId: ReturnType<typeof vi.fn> };
  let auditRepo: { create: ReturnType<typeof vi.fn> };

  const userId = 'user-instructor-1';
  const courseId = 'course-1';

  const mockCourse: Course = {
    id: courseId,
    title: 'Test Course',
    description: null,
    ownerUserId: userId,
    createdByUserId: userId,
    status: 'draft',
    style: 'bootcamp',
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

  const mockCourseFrozen: Course = {
    ...mockCourse,
    isFrozen: true,
    frozenAt: new Date(),
    frozenByUserId: 'op-1',
  };

  const mockCourseApproved: Course = {
    ...mockCourse,
    status: 'pending_approval',
    approvalRequestedAt: new Date(),
    approvedAt: new Date(),
    approvedByUserId: 'op-1',
  };

  const mockMemberOwner: CourseMember = {
    id: 'cm-1',
    courseId,
    userId,
    role: CourseMemberRole.instructor_owner,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMemberInstructor: CourseMember = {
    ...mockMemberOwner,
    role: CourseMemberRole.instructor,
  };

  const mockStats: CourseStats = {
    learnerCount: 0,
    assignmentCount: 0,
    lessonCount: 0,
    activeChannelCount: 0,
  };

  const mockUser: AuthenticatedUser = {
    userId,
    email: 'inst@example.com',
    name: 'Instructor',
    globalRole: 'instructor',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    courseRepo = {
      findByInstructor: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      setStatusToPendingApproval: vi.fn(),
      setStatusToActive: vi.fn(),
      findCourseStats: vi.fn().mockResolvedValue(mockStats),
      findChannelAndMemberCounts: vi.fn().mockResolvedValue(
        new Map([[courseId, { channelCount: 0, memberCount: 1 }]]),
      ),
    };
    memberRepo = {
      findByUserAndCourse: vi.fn(),
      create: vi.fn().mockResolvedValue(mockMemberOwner),
    };
    channelRepo = {
      findManyByCourseId: vi.fn().mockResolvedValue([]),
    };
    auditRepo = { create: vi.fn().mockResolvedValue(undefined) };

    useCase = new InstructorCourseUseCase(
      courseRepo as unknown as CourseRepository,
      memberRepo as unknown as CourseMemberRepository,
      channelRepo as unknown as CourseChannelRepository,
      auditRepo as unknown as AuditEventRepository,
    );
  });

  describe('listCourses (API-025)', () => {
    it('正常系: 自講座一覧を返す', async () => {
      courseRepo.findByInstructor.mockResolvedValue([mockCourse]);
      courseRepo.findChannelAndMemberCounts.mockResolvedValue(
        new Map([[courseId, { channelCount: 2, memberCount: 3 }]]),
      );

      const result = await useCase.listCourses(userId);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].course.id).toBe(courseId);
      expect(result.items[0].channelCount).toBe(2);
      expect(result.items[0].memberCount).toBe(3);
      expect(result.items[0].isFrozen).toBe(false);
      expect(courseRepo.findByInstructor).toHaveBeenCalledWith(userId);
    });

    it('講座が0件のとき空配列を返す', async () => {
      courseRepo.findByInstructor.mockResolvedValue([]);
      courseRepo.findChannelAndMemberCounts.mockResolvedValue(new Map());

      const result = await useCase.listCourses(userId);

      expect(result.items).toHaveLength(0);
    });
  });

  describe('createCourse (API-026)', () => {
    it('正常系: 講座作成 + CourseMember(instructor_owner) 作成', async () => {
      courseRepo.create.mockResolvedValue(mockCourse);
      courseRepo.findById.mockResolvedValue(mockCourse);

      await useCase.createCourse(userId, {
        title: 'New Course',
        style: 'seminar',
      });

      expect(courseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Course',
          style: 'seminar',
          ownerUserId: userId,
          createdByUserId: userId,
        }),
      );
      expect(memberRepo.create).toHaveBeenCalledWith({
        courseId,
        userId,
        role: CourseMemberRole.instructor_owner,
      });
    });
  });

  describe('getCourse (API-027)', () => {
    it('正常系: 講座詳細を返す', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue(mockCourse);

      const result = await useCase.getCourse(userId, courseId);

      expect(result.course.id).toBe(courseId);
      expect(result.stats).toEqual(mockStats);
      expect(result.channels).toEqual([]);
    });

    it('権限NG: 非メンバー → 403 ForbiddenException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(null);

      await expect(useCase.getCourse(userId, courseId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(courseRepo.findById).not.toHaveBeenCalled();
    });

    it('権限NG: learner ロール → 403 ForbiddenException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue({
        ...mockMemberOwner,
        role: CourseMemberRole.learner,
      });

      await expect(useCase.getCourse(userId, courseId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('講座が存在しない → 404 NotFoundException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue(null);
      courseRepo.findCourseStats.mockResolvedValue(mockStats);
      channelRepo.findManyByCourseId.mockResolvedValue([]);

      await expect(useCase.getCourse(userId, courseId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCourse (API-028)', () => {
    it('正常系: 講座情報を更新', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.update.mockResolvedValue({ ...mockCourse, title: 'Updated' });
      courseRepo.findCourseStats.mockResolvedValue(mockStats);
      channelRepo.findManyByCourseId.mockResolvedValue([]);

      const result = await useCase.updateCourse(userId, courseId, {
        title: 'Updated',
      });

      expect(result.course.title).toBe('Test Course');
      expect(courseRepo.update).toHaveBeenCalledWith(
        courseId,
        expect.objectContaining({ title: 'Updated' }),
      );
    });

    it('権限NG: instructor_owner でない → 403 ForbiddenException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberInstructor);

      await expect(
        useCase.updateCourse(userId, courseId, { title: 'Updated' }),
      ).rejects.toThrow(ForbiddenException);
      expect(courseRepo.update).not.toHaveBeenCalled();
    });

    it('凍結時 → 423 HttpException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue(mockCourseFrozen);

      await expect(
        useCase.updateCourse(userId, courseId, { title: 'Updated' }),
      ).rejects.toThrow(HttpException);
      expect(courseRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCourse (API-029)', () => {
    it('正常系: 論理削除（archived）', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.archive.mockResolvedValue({
        ...mockCourse,
        status: 'archived',
      });

      const result = await useCase.deleteCourse(userId, courseId);

      expect(result.success).toBe(true);
      expect(courseRepo.archive).toHaveBeenCalledWith(courseId);
    });

    it('権限NG: instructor_owner でない → 403 ForbiddenException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberInstructor);

      await expect(useCase.deleteCourse(userId, courseId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(courseRepo.archive).not.toHaveBeenCalled();
    });
  });

  describe('requestApproval (API-030)', () => {
    it('正常系: status を pending_approval に変更', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue(mockCourse);
      courseRepo.setStatusToPendingApproval.mockResolvedValue({
        ...mockCourse,
        status: 'pending_approval',
      });
      courseRepo.findCourseStats.mockResolvedValue(mockStats);
      channelRepo.findManyByCourseId.mockResolvedValue([]);

      const result = await useCase.requestApproval(userId, courseId);

      expect(result.course.id).toBe(courseId);
      expect(courseRepo.setStatusToPendingApproval).toHaveBeenCalledWith(
        courseId,
      );
    });

    it('凍結時 → 423 HttpException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue(mockCourseFrozen);

      await expect(useCase.requestApproval(userId, courseId)).rejects.toThrow(
        HttpException,
      );
      expect(courseRepo.setStatusToPendingApproval).not.toHaveBeenCalled();
    });
  });

  describe('publishCourse (API-031)', () => {
    it('正常系: 承認済み講座を公開 + AUDIT_LOG 記録', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue(mockCourseApproved);
      courseRepo.setStatusToActive.mockResolvedValue({
        ...mockCourseApproved,
        status: 'active',
      });
      courseRepo.findCourseStats.mockResolvedValue(mockStats);
      channelRepo.findManyByCourseId.mockResolvedValue([]);

      const result = await useCase.publishCourse(mockUser, courseId);

      expect(result.course.id).toBe(courseId);
      expect(courseRepo.setStatusToActive).toHaveBeenCalledWith(courseId);
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId: userId,
          eventType: 'course_published',
          courseId,
          reason: 'Instructor course publish',
          metaJson: expect.objectContaining({
            courseTitle: mockCourseApproved.title,
            courseId,
            ownerUserId: userId,
          }),
        }),
      );
    });

    it('403: ownerUserId 不一致 → ForbiddenException', async () => {
      const otherOwnerCourse = {
        ...mockCourseApproved,
        ownerUserId: 'other-owner',
      };
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue(otherOwnerCourse);

      await expect(useCase.publishCourse(mockUser, courseId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(courseRepo.setStatusToActive).not.toHaveBeenCalled();
      expect(auditRepo.create).not.toHaveBeenCalled();
    });

    it('凍結時 → 423 HttpException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue({
        ...mockCourseApproved,
        isFrozen: true,
      });

      await expect(useCase.publishCourse(mockUser, courseId)).rejects.toThrow(
        HttpException,
      );
      expect(courseRepo.setStatusToActive).not.toHaveBeenCalled();
    });

    it('未承認の講座 → 400 BadRequestException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMemberOwner);
      courseRepo.findById.mockResolvedValue(mockCourse);

      await expect(useCase.publishCourse(mockUser, courseId)).rejects.toThrow(
        BadRequestException,
      );
      expect(courseRepo.setStatusToActive).not.toHaveBeenCalled();
    });
  });
});
