import { Injectable } from '@nestjs/common';

/**
 * シラバス管理ユースケース（講師）
 *
 * INS-01チケット: API-034〜041
 * Facade型 UseCase（既存モジュール方針に準拠）
 */
@Injectable()
export class SyllabusUseCase {
  constructor(
    // TODO(TBD): Cursor実装 — DI 対象 Repository を注入
    // - CourseRepository（凍結チェック用）
    // - CourseSectionRepository
    // - LessonRepository
    // - CourseMemberRepository（権限確認用）
  ) {}

  /** API-034: シラバス構造取得 */
  async getSyllabus(userId: string, courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - CourseMember での所属確認
    // - CourseSection + Lesson 階層取得
    // - SyllabusView として返却
    throw new Error('Not implemented');
  }

  /**
   * API-035: セクション追加
   * x-policy: 423_ON_FROZEN
   */
  async addSection(userId: string, courseId: string, data: unknown): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - 凍結チェック（423_ON_FROZEN）
    // - CourseMember での所属確認
    // - CourseSection 追加
    // - 更新後 SyllabusView を返却
    throw new Error('Not implemented');
  }

  /**
   * API-036: セクション編集
   * x-policy: 423_ON_FROZEN
   */
  async updateSection(userId: string, sectionId: string, data: unknown): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - 凍結チェック（423_ON_FROZEN）
    // - CourseMember での所属確認（sectionId → courseId 経由）
    throw new Error('Not implemented');
  }

  /**
   * API-037: セクション削除
   * x-policy: 423_ON_FROZEN
   */
  async deleteSection(userId: string, sectionId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - 凍結チェック（423_ON_FROZEN）
    // - CourseMember での所属確認
    // - 配下 Lesson の削除判断
    throw new Error('Not implemented');
  }

  /**
   * API-038: レッスン作成
   * x-policy: 423_ON_FROZEN
   */
  async createLesson(userId: string, sectionId: string, data: unknown): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - 凍結チェック（423_ON_FROZEN）
    // - CourseMember での所属確認（sectionId → courseId 経由）
    throw new Error('Not implemented');
  }

  /** API-039: レッスン詳細取得 */
  async getLesson(userId: string, lessonId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - CourseMember での所属確認（lessonId → sectionId → courseId 経由）
    throw new Error('Not implemented');
  }

  /**
   * API-040: レッスン編集
   * x-policy: 423_ON_FROZEN
   */
  async updateLesson(userId: string, lessonId: string, data: unknown): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - 凍結チェック（423_ON_FROZEN）
    // - CourseMember での所属確認（lessonId → sectionId → courseId 経由）
    throw new Error('Not implemented');
  }

  /**
   * API-041: レッスン削除
   * x-policy: 423_ON_FROZEN
   */
  async deleteLesson(userId: string, lessonId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - 凍結チェック（423_ON_FROZEN）
    // - CourseMember での所属確認（lessonId → sectionId → courseId 経由）
    throw new Error('Not implemented');
  }
}
