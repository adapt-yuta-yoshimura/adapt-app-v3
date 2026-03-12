import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { CourseMemberRole } from '@prisma/client';
import type { paths } from '@adapt/types/openapi-app';
import { CourseRepository } from '../repositories/course.repository';
import { CourseSectionRepository } from '../repositories/course-section.repository';
import { LessonRepository } from '../repositories/lesson.repository';
import { CourseMemberRepository } from '../repositories/course-member.repository';
import type { CourseSectionWithLessons } from '../repositories/course-section.repository';

type SyllabusView =
  paths['/api/v1/instructor/courses/{courseId}/syllabus']['get']['responses']['200']['content']['application/json'];
type GenericDetailView =
  paths['/api/v1/instructor/lessons/{lessonId}']['get']['responses']['200']['content']['application/json'];

/**
 * シラバス管理ユースケース（講師）
 *
 * INS-01チケット: API-034〜041
 * Facade型 UseCase（既存モジュール方針に準拠）
 */
@Injectable()
export class SyllabusUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly sectionRepo: CourseSectionRepository,
    private readonly lessonRepo: LessonRepository,
    private readonly memberRepo: CourseMemberRepository,
  ) {}

  /** API-034: シラバス構造取得 */
  async getSyllabus(
    userId: string,
    courseId: string,
  ): Promise<SyllabusView> {
    await this.ensureInstructorMember(userId, courseId);
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    const sections = await this.sectionRepo.findByCourseId(courseId);
    return {
      courseId,
      style: course.style,
      sections: sections.map((s) => this.toSectionSchema(s)),
    };
  }

  /**
   * API-035: セクション追加
   * x-policy: 423_ON_FROZEN
   */
  async addSection(
    userId: string,
    courseId: string,
    data: { title?: string; order?: number },
  ): Promise<SyllabusView> {
    await this.ensureInstructorMember(userId, courseId);
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.isFrozen) {
      throw new HttpException('Course is frozen', 423);
    }
    const nextOrder =
      data.order ??
      (await this.sectionRepo.findByCourseId(courseId)).length;
    const title = (data.title as string) ?? 'New Section';
    await this.sectionRepo.create({ courseId, title, order: nextOrder });
    return this.getSyllabus(userId, courseId);
  }

  /**
   * API-036: セクション編集
   * x-policy: 423_ON_FROZEN
   */
  async updateSection(
    userId: string,
    sectionId: string,
    data: { title?: string; order?: number },
  ): Promise<{ success: boolean; message?: string }> {
    const section = await this.sectionRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    await this.ensureInstructorMember(userId, section.courseId);
    const course = await this.courseRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.isFrozen) {
      throw new HttpException('Course is frozen', 423);
    }
    await this.sectionRepo.update(sectionId, {
      title: data.title,
      order: data.order,
    });
    return { success: true };
  }

  /**
   * API-037: セクション削除
   * x-policy: 423_ON_FROZEN
   */
  async deleteSection(
    userId: string,
    sectionId: string,
  ): Promise<{ success: boolean; message?: string }> {
    const section = await this.sectionRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    await this.ensureInstructorMember(userId, section.courseId);
    const course = await this.courseRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.isFrozen) {
      throw new HttpException('Course is frozen', 423);
    }
    await this.sectionRepo.delete(sectionId);
    return { success: true };
  }

  /**
   * API-038: レッスン作成
   * x-policy: 423_ON_FROZEN
   */
  async createLesson(
    userId: string,
    sectionId: string,
    data: { title?: string },
  ): Promise<{ success: boolean; message?: string }> {
    const section = await this.sectionRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    await this.ensureInstructorMember(userId, section.courseId);
    const course = await this.courseRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.isFrozen) {
      throw new HttpException('Course is frozen', 423);
    }
    const title = (data.title as string) ?? 'New Lesson';
    await this.lessonRepo.create({
      courseId: section.courseId,
      courseSectionId: sectionId,
      title,
    });
    return { success: true };
  }

  /** API-039: レッスン詳細取得 */
  async getLesson(
    userId: string,
    lessonId: string,
  ): Promise<GenericDetailView> {
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    const courseId = lesson.courseSectionId
      ? (await this.sectionRepo.findById(lesson.courseSectionId))?.courseId
      : lesson.courseId;
    if (!courseId) {
      throw new NotFoundException('Course not found');
    }
    await this.ensureInstructorMember(userId, courseId);
    return this.toGenericDetailView(lesson);
  }

  /**
   * API-040: レッスン編集
   * x-policy: 423_ON_FROZEN
   */
  async updateLesson(
    userId: string,
    lessonId: string,
    data: { title?: string; type?: string },
  ): Promise<{ success: boolean; message?: string }> {
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    const courseId = lesson.courseSectionId
      ? (await this.sectionRepo.findById(lesson.courseSectionId))?.courseId
      : lesson.courseId;
    if (!courseId) {
      throw new NotFoundException('Course not found');
    }
    await this.ensureInstructorMember(userId, courseId);
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.isFrozen) {
      throw new HttpException('Course is frozen', 423);
    }
    await this.lessonRepo.update(lessonId, {
      title: data.title,
      type:
        data.type === 'text' ||
        data.type === 'video' ||
        data.type === 'live' ||
        data.type === 'assignment'
          ? data.type
          : undefined,
    });
    return { success: true };
  }

  /**
   * API-041: レッスン削除
   * x-policy: 423_ON_FROZEN
   */
  async deleteLesson(
    userId: string,
    lessonId: string,
  ): Promise<{ success: boolean; message?: string }> {
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    const courseId = lesson.courseSectionId
      ? (await this.sectionRepo.findById(lesson.courseSectionId))?.courseId
      : lesson.courseId;
    if (!courseId) {
      throw new NotFoundException('Course not found');
    }
    await this.ensureInstructorMember(userId, courseId);
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.isFrozen) {
      throw new HttpException('Course is frozen', 423);
    }
    await this.lessonRepo.delete(lessonId);
    return { success: true };
  }

  private async ensureInstructorMember(
    userId: string,
    courseId: string,
  ): Promise<void> {
    const member = await this.memberRepo.findByUserAndCourse(userId, courseId);
    if (!member || !['instructor', 'instructor_owner'].includes(member.role)) {
      throw new ForbiddenException('Access denied');
    }
  }

  private toSectionSchema(
    s: CourseSectionWithLessons,
  ): SyllabusView['sections'][number] {
    return {
      id: s.id,
      courseId: s.courseId,
      title: s.title,
      order: s.order,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      lessons: s.lessons.map((l) => ({
        id: l.id,
        courseId: l.courseId,
        courseSectionId: l.courseSectionId,
        type: l.type,
        title: l.title,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      })),
    };
  }

  private toGenericDetailView(lesson: {
    id: string;
    courseId: string;
    courseSectionId: string | null;
    title: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
  }): GenericDetailView {
    return {
      id: lesson.id,
      courseId: lesson.courseId,
      courseSectionId: lesson.courseSectionId,
      title: lesson.title,
      type: lesson.type,
      createdAt: lesson.createdAt.toISOString(),
      updatedAt: lesson.updatedAt.toISOString(),
    };
  }
}
