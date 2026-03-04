import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * 講座リポジトリ
 *
 * Course テーブルへのデータアクセスを担当。
 * SoT: schema.prisma - Course モデル
 */
@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params?: {
    status?: string;
    isFrozen?: boolean;
    page?: number;
    perPage?: number;
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async create(params: {
    title: string;
    style: string;
    ownerUserId: string;
    createdByUserId: string;
    description?: string;
    catalogVisibility?: string;
    visibility?: string;
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - status=draft（初期値）
    throw new Error('Not implemented');
  }

  async update(id: string, params: {
    title?: string;
    description?: string;
    catalogVisibility?: string;
    visibility?: string;
    ownerUserId?: string;
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async archive(id: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - status = archived
    throw new Error('Not implemented');
  }

  async approve(id: string, approvedByUserId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - status = active, approvedAt = now(), approvedByUserId
    throw new Error('Not implemented');
  }

  async freeze(id: string, frozenByUserId: string, reason?: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - isFrozen = true, frozenAt = now(), frozenByUserId, freezeReason
    throw new Error('Not implemented');
  }

  async unfreeze(id: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - isFrozen = false, frozenAt = null, frozenByUserId = null, freezeReason = null
    throw new Error('Not implemented');
  }
}
