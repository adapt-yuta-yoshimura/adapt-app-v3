import { Injectable } from '@nestjs/common';
import type { Course, CourseCatalogVisibility, CourseStatus, CourseStyle, CourseVisibility } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/** 一覧取得のフィルター・ページネーション */
export type CourseFindManyParams = {
  page?: number;
  perPage?: number;
  status?: CourseStatus;
  style?: CourseStyle;
  titleSearch?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
};

/** 一覧取得結果 */
export type CourseFindManyResult = {
  items: Course[];
  totalCount: number;
};

/** 作成パラメータ */
export type CourseCreateParams = {
  title: string;
  style: CourseStyle;
  ownerUserId: string;
  createdByUserId: string;
  description?: string | null;
  catalogVisibility?: CourseCatalogVisibility;
  visibility?: CourseVisibility;
};

/** 更新パラメータ */
export type CourseUpdateParams = {
  title?: string;
  description?: string | null;
  catalogVisibility?: CourseCatalogVisibility;
  visibility?: CourseVisibility;
  ownerUserId?: string;
};

/**
 * 講座リポジトリ
 *
 * Course テーブルへのデータアクセスを担当。
 * SoT: schema.prisma - Course モデル
 */
@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params?: CourseFindManyParams): Promise<CourseFindManyResult> {
    const page = Math.max(1, params?.page ?? 1);
    const perPage = Math.min(100, Math.max(1, params?.perPage ?? 20));
    const skip = (page - 1) * perPage;

    const where: Prisma.CourseWhereInput = {};
    if (params?.status !== undefined) {
      where.status = params.status;
    }
    if (params?.style !== undefined) {
      where.style = params.style;
    }
    if (params?.titleSearch !== undefined && params.titleSearch.trim() !== '') {
      where.title = { contains: params.titleSearch.trim(), mode: 'insensitive' };
    }

    const orderBy: Prisma.CourseOrderByWithRelationInput = (() => {
      const key = params?.sortBy ?? 'createdAt';
      const order = params?.sortOrder ?? 'desc';
      return { [key]: order };
    })();

    const [items, totalCount] = await Promise.all([
      this.prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
      this.prisma.course.count({ where }),
    ]);

    return { items, totalCount };
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
        ...(params.catalogVisibility !== undefined && { catalogVisibility: params.catalogVisibility }),
        ...(params.visibility !== undefined && { visibility: params.visibility }),
        ...(params.ownerUserId !== undefined && { ownerUserId: params.ownerUserId }),
      },
    });
  }

  async archive(id: string): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data: { status: 'archived' },
    });
  }

  async approve(id: string, approvedByUserId: string): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data: {
        status: 'active',
        approvedAt: new Date(),
        approvedByUserId,
      },
    });
  }

  async freeze(id: string, frozenByUserId: string, reason?: string | null): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data: {
        isFrozen: true,
        frozenAt: new Date(),
        frozenByUserId,
        ...(reason !== undefined && reason !== null && { freezeReason: reason }),
      },
    });
  }

  async unfreeze(id: string): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data: {
        isFrozen: false,
        frozenAt: null,
        frozenByUserId: null,
        freezeReason: null,
      },
    });
  }
}
