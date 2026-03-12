import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ForbiddenException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { CourseMemberRole } from '@prisma/client';
import type { Course, CourseMember, CourseSection, Lesson } from '@prisma/client';
import { SyllabusUseCase } from '../syllabus.usecase';
import { CourseRepository } from '../../repositories/course.repository';
import { CourseSectionRepository } from '../../repositories/course-section.repository';
import { LessonRepository } from '../../repositories/lesson.repository';
import { CourseMemberRepository } from '../../repositories/course-member.repository';

/**
 * INS-01: シラバス管理 UseCase テスト（API-034〜041）
 * 正常系・権限NG（403）・凍結423 をカバー
 */
describe('SyllabusUseCase', () => {
  let useCase: SyllabusUseCase;
  let courseRepo: { findById: ReturnType<typeof vi.fn> };
  let sectionRepo: {
    findByCourseId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let lessonRepo: {
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let memberRepo: { findByUserAndCourse: ReturnType<typeof vi.fn> };

  const userId = 'user-instructor-1';
  const courseId = 'course-1';
  const sectionId = 'section-1';
  const lessonId = 'lesson-1';

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
    createdAt: new Date(),
    updatedAt: new Date(),
    catalogVisibility: 'public_listed',
    visibility: 'public',
  };

  const mockCourseFrozen: Course = {
    ...mockCourse,
    isFrozen: true,
  };

  const mockMember: CourseMember = {
    id: 'cm-1',
    courseId,
    userId,
    role: CourseMemberRole.instructor_owner,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSection: CourseSection & { lessons: Lesson[] } = {
    id: sectionId,
    courseId,
    title: 'Week 1',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lessons: [],
  };

  const mockLesson: Lesson = {
    id: lessonId,
    courseId,
    courseSectionId: sectionId,
    title: 'Lesson 1',
    type: 'text',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    courseRepo = { findById: vi.fn() };
    sectionRepo = {
      findByCourseId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    lessonRepo = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    memberRepo = { findByUserAndCourse: vi.fn() };

    useCase = new SyllabusUseCase(
      courseRepo as unknown as CourseRepository,
      sectionRepo as unknown as CourseSectionRepository,
      lessonRepo as unknown as LessonRepository,
      memberRepo as unknown as CourseMemberRepository,
    );
  });

  describe('getSyllabus (API-034)', () => {
    it('正常系: シラバス構造を返す', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourse);
      sectionRepo.findByCourseId.mockResolvedValue([mockSection]);

      const result = await useCase.getSyllabus(userId, courseId);

      expect(result.courseId).toBe(courseId);
      expect(result.style).toBe('bootcamp');
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].id).toBe(sectionId);
      expect(result.sections[0].title).toBe('Week 1');
      expect(result.sections[0].lessons).toEqual([]);
    });

    it('権限NG: 非メンバー → 403 ForbiddenException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(null);

      await expect(useCase.getSyllabus(userId, courseId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('addSection (API-035)', () => {
    it('正常系: セクション追加後シラバスを返す', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourse);
      sectionRepo.findByCourseId.mockResolvedValue([]);
      sectionRepo.create.mockResolvedValue(mockSection);
      sectionRepo.findByCourseId.mockResolvedValue([mockSection]);

      const result = await useCase.addSection(userId, courseId, {
        title: 'New Section',
        order: 0,
      });

      expect(result.courseId).toBe(courseId);
      expect(sectionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId,
          title: 'New Section',
          order: 0,
        }),
      );
    });

    it('凍結時 → 423 HttpException', async () => {
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourseFrozen);

      await expect(
        useCase.addSection(userId, courseId, { title: 'New' }),
      ).rejects.toThrow(HttpException);
      expect(sectionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateSection (API-036)', () => {
    it('正常系: セクション編集', async () => {
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourse);
      sectionRepo.update.mockResolvedValue({ ...mockSection, title: 'Updated' });

      const result = await useCase.updateSection(userId, sectionId, {
        title: 'Updated',
      });

      expect(result.success).toBe(true);
      expect(sectionRepo.update).toHaveBeenCalledWith(
        sectionId,
        expect.objectContaining({ title: 'Updated' }),
      );
    });

    it('凍結時 → 423 HttpException', async () => {
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourseFrozen);

      await expect(
        useCase.updateSection(userId, sectionId, { title: 'Updated' }),
      ).rejects.toThrow(HttpException);
      expect(sectionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteSection (API-037)', () => {
    it('正常系: セクション削除', async () => {
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourse);
      sectionRepo.delete.mockResolvedValue(undefined);

      const result = await useCase.deleteSection(userId, sectionId);

      expect(result.success).toBe(true);
      expect(sectionRepo.delete).toHaveBeenCalledWith(sectionId);
    });

    it('凍結時 → 423 HttpException', async () => {
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourseFrozen);

      await expect(useCase.deleteSection(userId, sectionId)).rejects.toThrow(
        HttpException,
      );
      expect(sectionRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('createLesson (API-038)', () => {
    it('正常系: レッスン作成', async () => {
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourse);
      lessonRepo.create.mockResolvedValue(mockLesson);

      const result = await useCase.createLesson(userId, sectionId, {
        title: 'New Lesson',
      });

      expect(result.success).toBe(true);
      expect(lessonRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId,
          courseSectionId: sectionId,
          title: 'New Lesson',
        }),
      );
    });

    it('凍結時 → 423 HttpException', async () => {
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourseFrozen);

      await expect(
        useCase.createLesson(userId, sectionId, { title: 'New' }),
      ).rejects.toThrow(HttpException);
      expect(lessonRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('getLesson (API-039)', () => {
    it('正常系: レッスン詳細を返す', async () => {
      lessonRepo.findById.mockResolvedValue(mockLesson);
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);

      const result = await useCase.getLesson(userId, lessonId);

      expect(result.id).toBe(lessonId);
      expect(result.title).toBe('Lesson 1');
      expect(result.courseId).toBe(courseId);
    });

    it('レッスンが存在しない → 404 NotFoundException', async () => {
      lessonRepo.findById.mockResolvedValue(null);

      await expect(useCase.getLesson(userId, lessonId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLesson (API-040)', () => {
    it('正常系: レッスン編集', async () => {
      lessonRepo.findById.mockResolvedValue(mockLesson);
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourse);
      lessonRepo.update.mockResolvedValue({ ...mockLesson, title: 'Updated' });

      const result = await useCase.updateLesson(userId, lessonId, {
        title: 'Updated',
      });

      expect(result.success).toBe(true);
      expect(lessonRepo.update).toHaveBeenCalledWith(
        lessonId,
        expect.objectContaining({ title: 'Updated' }),
      );
    });

    it('凍結時 → 423 HttpException', async () => {
      lessonRepo.findById.mockResolvedValue(mockLesson);
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourseFrozen);

      await expect(
        useCase.updateLesson(userId, lessonId, { title: 'Updated' }),
      ).rejects.toThrow(HttpException);
      expect(lessonRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteLesson (API-041)', () => {
    it('正常系: レッスン削除', async () => {
      lessonRepo.findById.mockResolvedValue(mockLesson);
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourse);
      lessonRepo.delete.mockResolvedValue(undefined);

      const result = await useCase.deleteLesson(userId, lessonId);

      expect(result.success).toBe(true);
      expect(lessonRepo.delete).toHaveBeenCalledWith(lessonId);
    });

    it('凍結時 → 423 HttpException', async () => {
      lessonRepo.findById.mockResolvedValue(mockLesson);
      sectionRepo.findById.mockResolvedValue(mockSection);
      memberRepo.findByUserAndCourse.mockResolvedValue(mockMember);
      courseRepo.findById.mockResolvedValue(mockCourseFrozen);

      await expect(useCase.deleteLesson(userId, lessonId)).rejects.toThrow(
        HttpException,
      );
      expect(lessonRepo.delete).not.toHaveBeenCalled();
    });
  });
});
