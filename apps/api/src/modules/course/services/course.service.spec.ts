import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { CourseService } from './course.service';
import { CourseRepository } from '../repositories/course.repository';
import { CourseMemberRepository } from '../repositories/course-member.repository';

describe('CourseService', () => {
  let service: CourseService;
  let courseRepository: {
    findById: ReturnType<typeof vi.fn>;
    findByOwner: ReturnType<typeof vi.fn>;
    findPublicListed: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    countMembers: ReturnType<typeof vi.fn>;
    countChannels: ReturnType<typeof vi.fn>;
  };
  let courseMemberRepository: {
    findByUserAndCourse: ReturnType<typeof vi.fn>;
    findInstructorCourseIds: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  const mockCourse = {
    id: 'course-1',
    title: 'テストコース',
    description: 'テスト説明',
    ownerUserId: 'user-1',
    createdByUserId: 'user-1',
    status: 'draft',
    catalogVisibility: 'public_listed',
    visibility: 'members_only',
    isFrozen: false,
    frozenAt: null,
    frozenByUserId: null,
    freezeReason: null,
    approvalRequestedAt: null,
    approvedAt: null,
    approvedByUserId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    courseRepository = {
      findById: vi.fn(),
      findByOwner: vi.fn(),
      findPublicListed: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      countMembers: vi.fn(),
      countChannels: vi.fn(),
    };

    courseMemberRepository = {
      findByUserAndCourse: vi.fn(),
      findInstructorCourseIds: vi.fn(),
      create: vi.fn(),
    };

    service = new CourseService(
      courseRepository as unknown as CourseRepository,
      courseMemberRepository as unknown as CourseMemberRepository,
    );
  });

  describe('getCourse', () => {
    it('正常系: メンバーがコース詳細を取得できる', async () => {
      courseRepository.findById.mockResolvedValue(mockCourse);
      courseMemberRepository.findByUserAndCourse.mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        courseId: 'course-1',
        role: 'instructor_owner',
      });
      courseRepository.countMembers.mockResolvedValue(5);
      courseRepository.countChannels.mockResolvedValue(2);

      const result = await service.getCourse('user-1', 'course-1');

      expect(result.course.id).toBe('course-1');
      expect(result.course.title).toBe('テストコース');
      expect(result.stats.memberCount).toBe(5);
      expect(result.stats.channelCount).toBe(2);
    });

    it('異常系: コースが存在しない場合にNotFoundExceptionを投げる', async () => {
      courseRepository.findById.mockResolvedValue(null);

      await expect(
        service.getCourse('user-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('異常系: メンバーでない場合にForbiddenExceptionを投げる', async () => {
      courseRepository.findById.mockResolvedValue(mockCourse);
      courseMemberRepository.findByUserAndCourse.mockResolvedValue(null);

      await expect(
        service.getCourse('outsider', 'course-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('異常系: instructors_only のコースに learner がアクセスした場合', async () => {
      const restrictedCourse = {
        ...mockCourse,
        visibility: 'instructors_only',
      };
      courseRepository.findById.mockResolvedValue(restrictedCourse);
      courseMemberRepository.findByUserAndCourse.mockResolvedValue({
        id: 'member-1',
        userId: 'user-2',
        courseId: 'course-1',
        role: 'learner',
      });

      await expect(
        service.getCourse('user-2', 'course-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createCourse', () => {
    it('正常系: コースを作成し、作成者をinstructor_ownerとして追加する', async () => {
      courseRepository.create.mockResolvedValue(mockCourse);
      courseMemberRepository.create.mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        courseId: 'course-1',
        role: 'instructor_owner',
      });

      const result = await service.createCourse('user-1', {
        title: 'テストコース',
        description: 'テスト説明',
        catalogVisibility: 'public_listed',
        visibility: 'members_only',
      });

      expect(result.course.title).toBe('テストコース');
      expect(result.stats.memberCount).toBe(1);
      expect(result.stats.channelCount).toBe(0);

      expect(courseMemberRepository.create).toHaveBeenCalledWith({
        courseId: 'course-1',
        userId: 'user-1',
        role: 'instructor_owner',
      });
    });
  });

  describe('updateCourse', () => {
    it('正常系: instructor_ownerがコースを更新できる', async () => {
      courseRepository.findById.mockResolvedValue(mockCourse);
      courseMemberRepository.findByUserAndCourse.mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        courseId: 'course-1',
        role: 'instructor_owner',
      });
      courseRepository.update.mockResolvedValue({
        ...mockCourse,
        title: '更新後タイトル',
      });
      courseRepository.countMembers.mockResolvedValue(5);
      courseRepository.countChannels.mockResolvedValue(2);

      const result = await service.updateCourse('user-1', 'course-1', {
        title: '更新後タイトル',
      });

      expect(result.course.title).toBe('更新後タイトル');
    });

    it('異常系: 凍結中のコースは更新できない', async () => {
      const frozenCourse = { ...mockCourse, isFrozen: true };
      courseRepository.findById.mockResolvedValue(frozenCourse);

      await expect(
        service.updateCourse('user-1', 'course-1', { title: '変更' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('異常系: instructor_owner以外は更新できない', async () => {
      courseRepository.findById.mockResolvedValue(mockCourse);
      courseMemberRepository.findByUserAndCourse.mockResolvedValue({
        id: 'member-2',
        userId: 'user-2',
        courseId: 'course-1',
        role: 'learner',
      });

      await expect(
        service.updateCourse('user-2', 'course-1', { title: '変更' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPublicCourseDetail', () => {
    it('正常系: 公開コースの詳細を取得できる', async () => {
      courseRepository.findById.mockResolvedValue(mockCourse);
      courseRepository.countMembers.mockResolvedValue(10);
      courseRepository.countChannels.mockResolvedValue(3);

      const result = await service.getPublicCourseDetail('course-1');

      expect(result.course.id).toBe('course-1');
      expect(result.stats.memberCount).toBe(10);
    });

    it('異常系: 非公開コースは取得できない', async () => {
      const privateCourse = {
        ...mockCourse,
        catalogVisibility: 'private',
      };
      courseRepository.findById.mockResolvedValue(privateCourse);

      await expect(
        service.getPublicCourseDetail('course-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
