import { Injectable } from '@nestjs/common';
import {
  Course,
  CourseCatalogVisibility,
  CourseStatus,
  CourseVisibility,
} from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/** コース作成データ */
export interface CreateCourseData {
  title: string;
  description?: string;
  ownerUserId: string;
  createdByUserId: string;
  catalogVisibility: CourseCatalogVisibility;
  visibility: CourseVisibility;
  status?: CourseStatus;
}

/** コース更新データ */
export interface UpdateCourseData {
  title?: string;
  description?: string;
  catalogVisibility?: CourseCatalogVisibility;
  visibility?: CourseVisibility;
  status?: CourseStatus;
  approvalRequestedAt?: Date | null;
  approvedAt?: Date | null;
  approvedByUserId?: string | null;
}

/**
 * コースリポジトリ
 * コーステーブルへのデータアクセスを提供する
 * @see schema.prisma - Course
 */
@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * IDでコースを取得する
   * @param id コースID
   * @returns コース情報、見つからない場合はnull
   */
  async findById(id: string): Promise<Course | null> {
    return this.prisma.course.findUnique({
      where: { id },
    });
  }

  /**
   * オーナーユーザーIDでコース一覧を取得する
   * @param userId オーナーユーザーID
   * @returns コース配列
   */
  async findByOwner(userId: string): Promise<Course[]> {
    return this.prisma.course.findMany({
      where: { ownerUserId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 公開中のコース一覧を取得する（カタログ掲載あり）
   * @param page ページ番号（1始まり）
   * @param limit 取得件数
   * @returns コース配列
   */
  async findPublicListed(
    page: number,
    limit: number,
  ): Promise<{ items: Course[]; totalCount: number }> {
    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where: {
          catalogVisibility: 'public_listed',
          status: 'active',
          isFrozen: false,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.course.count({
        where: {
          catalogVisibility: 'public_listed',
          status: 'active',
          isFrozen: false,
        },
      }),
    ]);

    return { items, totalCount };
  }

  /**
   * コースを新規作成する
   * @param data コース作成データ
   * @returns 作成されたコース
   */
  async create(data: CreateCourseData): Promise<Course> {
    return this.prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        ownerUserId: data.ownerUserId,
        createdByUserId: data.createdByUserId,
        catalogVisibility: data.catalogVisibility,
        visibility: data.visibility,
        status: data.status ?? 'draft',
      },
    });
  }

  /**
   * コース情報を更新する
   * @param id コースID
   * @param data コース更新データ
   * @returns 更新されたコース
   */
  async update(id: string, data: UpdateCourseData): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  /**
   * コースのメンバー数を取得する
   * @param courseId コースID
   * @returns メンバー数
   */
  async countMembers(courseId: string): Promise<number> {
    return this.prisma.courseMember.count({
      where: { courseId },
    });
  }

  /**
   * コースのチャンネル数を取得する
   * @param courseId コースID
   * @returns チャンネル数
   */
  async countChannels(courseId: string): Promise<number> {
    return this.prisma.courseChannel.count({
      where: { courseId },
    });
  }
}
