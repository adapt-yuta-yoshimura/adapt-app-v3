import { Injectable } from '@nestjs/common';
import type {
  Course,
  CourseCatalogVisibility,
  CourseStyle,
  CourseVisibility,
} from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/** 講師の自講座一覧取得用（CourseMember 経由で courseId を取得してから Course を取得） */
export type CourseCreateParams = {
  title: string;
  style: CourseStyle;
  ownerUserId: string;
  createdByUserId: string;
  description?: string | null;
  catalogVisibility?: CourseCatalogVisibility;
  visibility?: CourseVisibility;
};

export type CourseUpdateParams = {
  title?: string;
  description?: string | null;
  catalogVisibility?: CourseCatalogVisibility;
  visibility?: CourseVisibility;
  ownerUserId?: string;
};

export type CourseStats = {
  learnerCount: number;
  assignmentCount: number;
  lessonCount: number;
  activeChannelCount: number;
};

/**
 * 講座リポジトリ（講師向け）
 *
 * 注意: admin-course モジュールにも CourseRepository が存在する。
 * 将来的に共通 Repository への統合を検討すること。
 * 現時点では instructor 固有のクエリパターンを分離するため独立。
 * SoT: schema.prisma - Course モデル
 */
@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 講師として所属する講座一覧を取得（CourseMember.role が instructor または instructor_owner）
   */
  async findByInstructor(userId: string): Promise<Course[]> {
    const members = await this.prisma.courseMember.findMany({
      where: {
        userId,
        role: { in: ['instructor', 'instructor_owner'] },
      },
      select: { courseId: true },
    });
    const courseIds = members.map((m) => m.courseId);
    if (courseIds.length === 0) {
      return [];
    }
    return this.prisma.course.findMany({
      where: { id: { in: courseIds } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Course | null> {
    return this.prisma.course.findUnique({
      where: { id },
    });
  }

  async create(params: CourseCreateParams): Promise<Course> {
    return this.prisma.course.create({
      data: {
        title: params.title,
        description: params.description ?? undefined,
        ownerUserId: params.ownerUserId,
        createdByUserId: params.createdByUserId,
        status: 'draft',
        style: params.style,
        catalogVisibility: params.catalogVisibility ?? 'public_listed',
        visibility: params.visibility ?? 'public',
      },
    });
  }

  async update(id: string, params: CourseUpdateParams): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data: {
        ...(params.title !== undefined && { title: params.title }),
        ...(params.description !== undefined && { description: params.description }),
        ...(params.catalogVisibility !== undefined && {
          catalogVisibility: params.catalogVisibility,
        }),
        ...(params.visibility !== undefined && { visibility: params.visibility }),
        ...(params.ownerUserId !== undefined && { ownerUserId: params.ownerUserId }),
      },
    });
  }

  /** 論理削除（status → archived） */
  async archive(id: string): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data: { status: 'archived' },
    });
  }

  /** 承認申請（status → pending_approval） */
  async setStatusToPendingApproval(id: string): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data: {
        status: 'pending_approval',
        approvalRequestedAt: new Date(),
      },
    });
  }

  /** 公開（status → active、承認済み前提） */
  async setStatusToActive(id: string): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data: {
        status: 'active',
        approvedAt: new Date(),
      },
    });
  }

  /** CourseDetailView 用の stats 取得（1クエリで集計） */
  async findCourseStats(courseId: string): Promise<CourseStats> {
    const [learnerCount, assignmentCount, lessonCount, activeChannelCount] =
      await Promise.all([
        this.prisma.courseMember.count({
          where: { courseId, role: 'learner' },
        }),
        this.prisma.assignment.count({
          where: { courseId },
        }),
        this.prisma.lesson.count({
          where: { courseId },
        }),
        this.prisma.courseChannel.count({
          where: { courseId },
        }),
      ]);
    return {
      learnerCount,
      assignmentCount,
      lessonCount,
      activeChannelCount,
    };
  }

  /** 複数コースの channelCount / memberCount（一覧用） */
  async findChannelAndMemberCounts(
    courseIds: string[],
  ): Promise<Map<string, { channelCount: number; memberCount: number }>> {
    if (courseIds.length === 0) {
      return new Map();
    }
    const [channelCounts, memberCounts] = await Promise.all([
      this.prisma.courseChannel.groupBy({
        by: ['courseId'],
        where: { courseId: { in: courseIds } },
        _count: { id: true },
      }),
      this.prisma.courseMember.groupBy({
        by: ['courseId'],
        where: { courseId: { in: courseIds } },
        _count: { id: true },
      }),
    ]);
    const map = new Map<
      string,
      { channelCount: number; memberCount: number }
    >();
    for (const id of courseIds) {
      map.set(id, {
        channelCount:
          channelCounts.find((c) => c.courseId === id)?._count.id ?? 0,
        memberCount:
          memberCounts.find((m) => m.courseId === id)?._count.id ?? 0,
      });
    }
    return map;
  }
}
