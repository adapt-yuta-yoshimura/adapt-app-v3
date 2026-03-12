import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { ChannelRepository } from './channel.repository';
import { CourseMemberRepository } from '../instructor-course/repositories/course-member.repository';
import { CourseRepository } from '../instructor-course/repositories/course.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type CourseChannelListResponse =
  paths['/api/v1/courses/{courseId}/channels']['get']['responses']['200']['content']['application/json'];
type ChannelCreateBody =
  paths['/api/v1/courses/{courseId}/channels']['post']['requestBody']['content']['application/json'];
type ChannelCreateResponse =
  paths['/api/v1/courses/{courseId}/channels']['post']['responses']['201']['content']['application/json'];
type ChannelUpdateBody =
  paths['/api/v1/channels/{channelId}']['put']['requestBody']['content']['application/json'];
type ChannelUpdateResponse =
  paths['/api/v1/channels/{channelId}']['put']['responses']['200']['content']['application/json'];
type ChannelDeleteResponse =
  paths['/api/v1/channels/{channelId}']['delete']['responses']['200']['content']['application/json'];

/**
 * チャンネル管理 UseCase
 *
 * API-049: チャンネル一覧取得
 * API-050: チャンネル作成
 * API-051: チャンネル編集
 * API-052: チャンネル削除
 */
@Injectable()
export class ChannelUseCase {
  constructor(
    private readonly channelRepo: ChannelRepository,
    private readonly memberRepo: CourseMemberRepository,
    private readonly courseRepo: CourseRepository,
  ) {}

  /**
   * API-049: チャンネル一覧取得
   * x-roles: all_in_course
   */
  async getChannels(
    courseId: string,
    userId: string,
  ): Promise<CourseChannelListResponse> {
    // TODO(TBD): Cursor実装
    // 1. all_in_course 権限確認（CourseMember に courseId + userId が存在するか）
    // 2. CourseChannel を courseId でフィルタ取得
    // 3. visibility に応じてフィルタ
    throw new Error('Not implemented');
  }

  /**
   * API-050: チャンネル作成
   * x-roles: instructor_owner
   * x-policy: 423_ON_FROZEN
   */
  async create(
    courseId: string,
    body: ChannelCreateBody,
    userId: string,
  ): Promise<ChannelCreateResponse> {
    // TODO(TBD): Cursor実装
    // 1. instructor_owner 権限確認
    // 2. 凍結チェック（423_ON_FROZEN）
    // 3. CourseChannel 作成（isManual: true）
    throw new Error('Not implemented');
  }

  /**
   * API-051: チャンネル編集
   * x-roles: instructor_owner
   * x-policy: 423_ON_FROZEN
   */
  async update(
    channelId: string,
    body: ChannelUpdateBody,
    userId: string,
  ): Promise<ChannelUpdateResponse> {
    // TODO(TBD): Cursor実装
    // 1. チャンネル取得 → courseId 特定
    // 2. instructor_owner 権限確認
    // 3. 凍結チェック（423_ON_FROZEN）
    // 4. name, visibility 等を更新
    throw new Error('Not implemented');
  }

  /**
   * API-052: チャンネル削除
   * x-roles: instructor_owner
   * x-policy: 423_ON_FROZEN
   */
  async delete(
    channelId: string,
    userId: string,
  ): Promise<ChannelDeleteResponse> {
    // TODO(TBD): Cursor実装
    // 1. instructor_owner 権限確認
    // 2. 凍結チェック（423_ON_FROZEN）
    // 3. 論理削除（過去ログは監査用に保持）
    throw new Error('Not implemented');
  }
}
