import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { MessageRepository } from './message.repository';
import { ThreadRepository } from './thread.repository';
import { ChannelRepository } from './channel.repository';
import { CourseMemberRepository } from '../instructor-course/repositories/course-member.repository';
import { CourseRepository } from '../instructor-course/repositories/course.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type MessageListResponse =
  paths['/api/v1/channels/{channelId}/messages']['get']['responses']['200']['content']['application/json'];
type PostMessageBody =
  paths['/api/v1/channels/{channelId}/messages']['post']['requestBody']['content']['application/json'];
type PostMessageResponse =
  paths['/api/v1/channels/{channelId}/messages']['post']['responses']['201']['content']['application/json'];
type ThreadDetailResponse =
  paths['/api/v1/messages/{messageId}/thread']['get']['responses']['200']['content']['application/json'];
type ReplyBody =
  paths['/api/v1/messages/{messageId}/replies']['post']['requestBody']['content']['application/json'];
type ReplyResponse =
  paths['/api/v1/messages/{messageId}/replies']['post']['responses']['201']['content']['application/json'];
type EditMessageBody =
  paths['/api/v1/messages/{messageId}']['patch']['requestBody']['content']['application/json'];
type EditMessageResponse =
  paths['/api/v1/messages/{messageId}']['patch']['responses']['200']['content']['application/json'];
type DeleteMessageResponse =
  paths['/api/v1/messages/{messageId}']['delete']['responses']['200']['content']['application/json'];

/**
 * メッセージ管理 UseCase
 *
 * API-053: メッセージ履歴取得
 * API-054: メッセージ投稿
 * API-055: スレッド詳細取得
 * API-056: スレッド返信投稿
 * API-057: メッセージ編集
 * API-058: メッセージ削除
 */
@Injectable()
export class MessageUseCase {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly threadRepo: ThreadRepository,
    private readonly channelRepo: ChannelRepository,
    private readonly memberRepo: CourseMemberRepository,
    private readonly courseRepo: CourseRepository,
  ) {}

  /**
   * API-053: メッセージ履歴取得
   * x-roles: all_in_course
   * x-policy: 閲覧のみ
   */
  async getMessages(
    channelId: string,
    userId: string,
  ): Promise<MessageListResponse> {
    // TODO(TBD): Cursor実装
    // 1. チャンネル取得 → courseId 特定
    // 2. all_in_course 権限確認（CourseMember に courseId + userId が存在するか）
    // 3. CourseMessage を channelId でフィルタ（threadId = null → ルートメッセージのみ）
    // 4. 各メッセージに author 情報を結合
    throw new Error('Not implemented');
  }

  /**
   * API-054: メッセージ投稿
   * x-roles: all_in_course
   * x-policy: threads_only(AUTO)
   */
  async post(
    channelId: string,
    body: PostMessageBody,
    userId: string,
  ): Promise<PostMessageResponse> {
    // TODO(TBD): Cursor実装
    // 1. チャンネル取得 → courseId 特定
    // 2. all_in_course 権限確認
    // 3. CourseMessage 作成
    // 4. x-policy: threads_only(AUTO) → 自動的に CourseThread を作成
    //    - postingMode が threads_only のチャンネルでは、ルートメッセージ投稿 = スレッド作成
    //    - CourseThread 作成（rootMessageId = 新メッセージID）
    throw new Error('Not implemented');
  }

  /**
   * API-055: スレッド詳細取得
   * x-roles: all_in_course
   */
  async getThread(
    messageId: string,
    userId: string,
  ): Promise<ThreadDetailResponse> {
    // TODO(TBD): Cursor実装
    // 1. メッセージ取得 → channelId → courseId 特定
    // 2. all_in_course 権限確認
    // 3. CourseThread 取得（rootMessageId = messageId）
    // 4. 配下の返信メッセージ一覧取得
    throw new Error('Not implemented');
  }

  /**
   * API-056: スレッド返信投稿
   * x-roles: all_in_course
   * x-policy: THREAD_REPLY（announcement チャンネルは講師以外返信不可）
   */
  async reply(
    messageId: string,
    body: ReplyBody,
    userId: string,
  ): Promise<ReplyResponse> {
    // TODO(TBD): Cursor実装
    // 1. メッセージ取得 → channelId → courseId 特定
    // 2. all_in_course 権限確認
    // 3. x-policy: THREAD_REPLY — announcement チャンネル（CourseChannel.type = 'announcement'）は講師以外返信不可
    // 4. CourseThread 取得（rootMessageId = messageId）
    // 5. CourseMessage 作成（threadId = thread.id）
    throw new Error('Not implemented');
  }

  /**
   * API-057: メッセージ編集
   * x-roles: owner_only
   * x-policy: 423_ON_FROZEN
   */
  async edit(
    messageId: string,
    body: EditMessageBody,
    userId: string,
  ): Promise<EditMessageResponse> {
    // TODO(TBD): Cursor実装
    // 1. メッセージ取得 → authorCourseMemberId で owner 確認
    //    - owner_only: CourseMessage.authorCourseMemberId → CourseMember.userId が currentUser と一致
    // 2. 凍結チェック（423_ON_FROZEN）— channelId → CourseChannel.courseId → Course.isFrozen
    // 3. text 更新
    // NOTE: 編集履歴の保持方式は schema.prisma 未定義（TBD）
    throw new Error('Not implemented');
  }

  /**
   * API-058: メッセージ削除
   * x-roles: owner_only, instructor
   * x-policy: 423_ON_FROZEN
   */
  async delete(
    messageId: string,
    userId: string,
  ): Promise<DeleteMessageResponse> {
    // TODO(TBD): Cursor実装
    // 1. owner_only or instructor（講師は他人の投稿も削除可）
    //    - owner_only: CourseMessage.authorCourseMemberId → CourseMember.userId が currentUser と一致
    //    - instructor: CourseMember.role が instructor/instructor_owner
    // 2. 凍結チェック（423_ON_FROZEN）
    // 3. 論理削除（返信がある場合は「削除されました」と表示）
    throw new Error('Not implemented');
  }
}
