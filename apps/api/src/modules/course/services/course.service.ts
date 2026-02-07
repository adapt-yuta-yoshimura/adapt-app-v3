import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  Course,
  CourseCatalogVisibility,
  CourseVisibility,
} from '@prisma/client';
import { DEFAULT_PAGE_SIZE } from '@adapt/shared';

import { CourseRepository } from '../repositories/course.repository';
import { CourseMemberRepository } from '../repositories/course-member.repository';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { UpdateCourseDto } from '../dtos/update-course.dto';
import {
  CourseResponseDto,
  CourseSummaryDto,
  CourseListResponseDto,
  CourseDetailResponseDto,
} from '../dtos/course-response.dto';

/**
 * コースサービス
 * コースに関するビジネスロジックを担当する
 * Prismaには直接依存せず、Repository層を通じてデータアクセスする
 */
@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly courseMemberRepository: CourseMemberRepository,
  ) {}

  /**
   * コース詳細を取得する（権限チェック付き）
   *
   * @param userId リクエストユーザーID
   * @param courseId コースID
   * @returns コース詳細レスポンス
   * @throws {NotFoundException} コースが見つからない場合
   * @throws {ForbiddenException} アクセス権限がない場合
   */
  async getCourse(
    userId: string,
    courseId: string,
  ): Promise<CourseDetailResponseDto> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // メンバーシップ確認
    const member = await this.courseMemberRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!member) {
      throw new ForbiddenException('You are not a member of this course');
    }

    // visibility チェック: instructors_only の場合、learner はアクセス不可
    if (
      course.visibility === 'instructors_only' &&
      member.role === 'learner'
    ) {
      throw new ForbiddenException(
        'This content is restricted to instructors only',
      );
    }

    const [memberCount, channelCount] = await Promise.all([
      this.courseRepository.countMembers(courseId),
      this.courseRepository.countChannels(courseId),
    ]);

    return {
      course: this.toCourseResponse(course),
      channels: [],
      stats: { memberCount, channelCount },
    };
  }

  /**
   * 自分が参加しているコース一覧を取得する（講師向け）
   *
   * @param userId ユーザーID
   * @returns コース一覧レスポンス
   */
  async getMyCourses(userId: string): Promise<CourseListResponseDto> {
    // 講師として参加しているコースIDを取得
    const courseIds =
      await this.courseMemberRepository.findInstructorCourseIds(userId);

    // オーナーのコースも含める
    const ownerCourses = await this.courseRepository.findByOwner(userId);
    const allCourseIds = [
      ...new Set([...courseIds, ...ownerCourses.map((c) => c.id)]),
    ];

    const items: CourseSummaryDto[] = [];

    for (const id of allCourseIds) {
      const course = await this.courseRepository.findById(id);
      if (!course) continue;

      const [memberCount, channelCount] = await Promise.all([
        this.courseRepository.countMembers(id),
        this.courseRepository.countChannels(id),
      ]);

      items.push({
        course: this.toCourseResponse(course),
        channelCount,
        memberCount,
        isFrozen: course.isFrozen,
      });
    }

    return {
      items,
      meta: {
        page: {
          totalCount: items.length,
          totalPages: 1,
          currentPage: 1,
          perPage: items.length,
        },
      },
    };
  }

  /**
   * 公開コース一覧を取得する（ストア向け）
   *
   * @param page ページ番号
   * @param limit 取得件数
   * @returns コース一覧レスポンス
   */
  async getPublicCourses(
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE,
  ): Promise<CourseListResponseDto> {
    const { items, totalCount } = await this.courseRepository.findPublicListed(
      page,
      limit,
    );

    const summaries: CourseSummaryDto[] = [];

    for (const course of items) {
      const [memberCount, channelCount] = await Promise.all([
        this.courseRepository.countMembers(course.id),
        this.courseRepository.countChannels(course.id),
      ]);

      summaries.push({
        course: this.toCourseResponse(course),
        channelCount,
        memberCount,
        isFrozen: course.isFrozen,
      });
    }

    return {
      items: summaries,
      meta: {
        page: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          perPage: limit,
        },
      },
    };
  }

  /**
   * 公開コース詳細を取得する（ストア向け、未認証でも可）
   *
   * @param courseId コースID
   * @returns コース詳細レスポンス
   * @throws {NotFoundException} コースが見つからないか非公開の場合
   */
  async getPublicCourseDetail(
    courseId: string,
  ): Promise<CourseDetailResponseDto> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // 非公開コースはストアに表示しない
    if (course.catalogVisibility === 'private') {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const [memberCount, channelCount] = await Promise.all([
      this.courseRepository.countMembers(courseId),
      this.courseRepository.countChannels(courseId),
    ]);

    return {
      course: this.toCourseResponse(course),
      channels: [],
      stats: { memberCount, channelCount },
    };
  }

  /**
   * コースを新規作成する
   * 作成者は自動的に instructor_owner としてメンバーに追加される
   *
   * @param userId 作成者ユーザーID
   * @param dto コース作成データ
   * @returns 作成されたコース詳細
   */
  async createCourse(
    userId: string,
    dto: CreateCourseDto,
  ): Promise<CourseDetailResponseDto> {
    const course = await this.courseRepository.create({
      title: dto.title,
      description: dto.description,
      ownerUserId: userId,
      createdByUserId: userId,
      catalogVisibility: dto.catalogVisibility as CourseCatalogVisibility,
      visibility: dto.visibility as CourseVisibility,
    });

    // 作成者を instructor_owner として追加
    await this.courseMemberRepository.create({
      courseId: course.id,
      userId,
      role: 'instructor_owner',
    });

    this.logger.log(`Course created: ${course.id} by user ${userId}`);

    return {
      course: this.toCourseResponse(course),
      channels: [],
      stats: { memberCount: 1, channelCount: 0 },
    };
  }

  /**
   * コース情報を更新する
   *
   * @param userId リクエストユーザーID
   * @param courseId コースID
   * @param dto コース更新データ
   * @returns 更新されたコース詳細
   * @throws {NotFoundException} コースが見つからない場合
   * @throws {ForbiddenException} 権限がない場合、または凍結中の場合
   */
  async updateCourse(
    userId: string,
    courseId: string,
    dto: UpdateCourseDto,
  ): Promise<CourseDetailResponseDto> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // 凍結チェック（423 Locked相当）
    if (course.isFrozen) {
      throw new ForbiddenException('Course is frozen and cannot be modified');
    }

    // 権限チェック: instructor_owner のみ更新可能
    await this.checkInstructorOwnerPermission(userId, courseId);

    const updated = await this.courseRepository.update(courseId, {
      title: dto.title,
      description: dto.description,
      catalogVisibility: dto.catalogVisibility as
        | CourseCatalogVisibility
        | undefined,
      visibility: dto.visibility as CourseVisibility | undefined,
    });

    const [memberCount, channelCount] = await Promise.all([
      this.courseRepository.countMembers(courseId),
      this.courseRepository.countChannels(courseId),
    ]);

    this.logger.log(`Course updated: ${courseId} by user ${userId}`);

    return {
      course: this.toCourseResponse(updated),
      channels: [],
      stats: { memberCount, channelCount },
    };
  }

  /**
   * コースを論理削除する（archived 状態に変更）
   *
   * @param userId リクエストユーザーID
   * @param courseId コースID
   * @throws {NotFoundException} コースが見つからない場合
   * @throws {ForbiddenException} 権限がない場合
   */
  async deleteCourse(userId: string, courseId: string): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // 権限チェック: instructor_owner のみ削除可能
    await this.checkInstructorOwnerPermission(userId, courseId);

    // status を archived に変更し、カタログ非公開にする（論理削除）
    await this.courseRepository.update(courseId, {
      status: 'archived',
      catalogVisibility: 'private',
    });

    this.logger.log(`Course deleted (archived): ${courseId} by user ${userId}`);
  }

  /**
   * instructor_owner 権限を確認する
   *
   * @param userId ユーザーID
   * @param courseId コースID
   * @throws {ForbiddenException} instructor_owner でない場合
   */
  private async checkInstructorOwnerPermission(
    userId: string,
    courseId: string,
  ): Promise<void> {
    const member = await this.courseMemberRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    if (!member || member.role !== 'instructor_owner') {
      throw new ForbiddenException(
        'Only the course owner can perform this action',
      );
    }
  }

  /**
   * Prisma Course モデルから CourseResponseDto に変換する
   * Prisma Model を直接 API レスポンスで返さない（DTO分離）
   *
   * @param course Prisma Course
   * @returns CourseResponseDto
   */
  private toCourseResponse(course: Course): CourseResponseDto {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      ownerUserId: course.ownerUserId,
      createdByUserId: course.createdByUserId,
      status: course.status,
      catalogVisibility: course.catalogVisibility,
      visibility: course.visibility,
      isFrozen: course.isFrozen,
      frozenAt: course.frozenAt?.toISOString() ?? null,
      frozenByUserId: course.frozenByUserId,
      freezeReason: course.freezeReason,
      approvalRequestedAt: course.approvalRequestedAt?.toISOString() ?? null,
      approvedAt: course.approvedAt?.toISOString() ?? null,
      approvedByUserId: course.approvedByUserId,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }
}
