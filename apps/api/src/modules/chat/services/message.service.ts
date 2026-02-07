import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CourseMessage } from '@prisma/client';
import { DEFAULT_PAGE_SIZE } from '@adapt/shared';

import { MessageRepository } from '../repositories/message.repository';
import { ThreadRepository } from '../repositories/thread.repository';
import { ChannelRepository } from '../repositories/channel.repository';
import { CourseMemberRepository } from '../../course/repositories/course-member.repository';

/** メッセージレスポンスDTO */
export interface MessageResponseDto {
  id: string;
  channelId: string;
  threadId: string | null;
  authorCourseMemberId: string | null;
  text: string;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
}

/** メッセージ一覧レスポンスDTO */
export interface MessageListResponseDto {
  messages: MessageResponseDto[];
  hasMore: boolean;
}

/** メッセージ詳細レスポンスDTO */
export interface MessageDetailResponseDto {
  message: MessageResponseDto;
}

/** メッセージ送信データ */
export interface SendMessageData {
  text: string;
  threadId?: string;
  isEmergency?: boolean;
}

/**
 * メッセージサービス
 * メッセージの送受信に関するビジネスロジックを担当する
 * Prismaには直接依存せず、Repository層を通じてデータアクセスする
 */
@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly courseMemberRepository: CourseMemberRepository,
  ) {}

  /**
   * チャンネル内のメッセージ一覧を取得する（カーソルベースページネーション）
   *
   * @param userId リクエストユーザーID
   * @param channelId チャンネルID
   * @param limit 取得件数
   * @param cursor カーソル（メッセージID）
   * @returns メッセージ一覧レスポンス
   * @throws {NotFoundException} チャンネルが見つからない場合
   * @throws {ForbiddenException} チャンネルメンバーでない場合
   */
  async getMessages(
    userId: string,
    channelId: string,
    limit: number = DEFAULT_PAGE_SIZE,
    cursor?: string,
  ): Promise<MessageListResponseDto> {
    const channel = await this.channelRepository.findById(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${channelId} not found`);
    }

    // コースメンバーシップ確認
    await this.validateChannelAccess(userId, channel.courseId);

    const messages = await this.messageRepository.findByChannel(
      channelId,
      limit + 1, // hasMore判定用に1件多く取得
      cursor,
    );

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;

    return {
      messages: items.map((msg) => this.toMessageResponse(msg)),
      hasMore,
    };
  }

  /**
   * メッセージを送信する
   *
   * @param userId 送信者ユーザーID
   * @param channelId チャンネルID
   * @param data メッセージ送信データ
   * @returns 送信されたメッセージ詳細
   * @throws {NotFoundException} チャンネルが見つからない場合
   * @throws {ForbiddenException} チャンネルメンバーでない場合、または凍結中の場合
   */
  async sendMessage(
    userId: string,
    channelId: string,
    data: SendMessageData,
  ): Promise<MessageDetailResponseDto> {
    const channel = await this.channelRepository.findById(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${channelId} not found`);
    }

    // 凍結チェック
    if (channel.isFrozen) {
      throw new ForbiddenException('Channel is frozen and cannot accept messages');
    }

    // コースメンバーシップ確認 + courseMemberId取得
    const courseMember = await this.courseMemberRepository.findByUserAndCourse(
      userId,
      channel.courseId,
    );
    if (!courseMember) {
      throw new ForbiddenException('You are not a member of this course');
    }

    // threads-only モードの場合、スレッドなしの新規メッセージは不可
    // （スレッド内返信は許可）
    if (channel.postingMode === 'threads_only' && !data.threadId) {
      throw new ForbiddenException(
        'This channel only allows messages within threads',
      );
    }

    // スレッドが指定されている場合、存在確認
    if (data.threadId) {
      const thread = await this.threadRepository.findById(data.threadId);
      if (!thread) {
        throw new NotFoundException(`Thread with ID ${data.threadId} not found`);
      }
    }

    const message = await this.messageRepository.create({
      channelId,
      threadId: data.threadId,
      authorCourseMemberId: courseMember.id,
      text: data.text,
      isEmergency: data.isEmergency,
    });

    this.logger.log(
      `Message sent: ${message.id} in channel ${channelId} by member ${courseMember.id}`,
    );

    return {
      message: this.toMessageResponse(message),
    };
  }

  /**
   * メッセージを更新する（著者本人のみ）
   *
   * @param userId リクエストユーザーID
   * @param messageId メッセージID
   * @param text 更新テキスト
   * @returns 更新されたメッセージ詳細
   * @throws {NotFoundException} メッセージが見つからない場合
   * @throws {ForbiddenException} 著者でない場合
   */
  async updateMessage(
    userId: string,
    messageId: string,
    text: string,
  ): Promise<MessageDetailResponseDto> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    // チャンネル凍結チェック
    const channel = await this.channelRepository.findById(message.channelId);
    if (channel?.isFrozen) {
      throw new ForbiddenException('Channel is frozen and messages cannot be modified');
    }

    // 著者チェック
    await this.checkMessageAuthor(userId, message);

    const updated = await this.messageRepository.update(messageId, text);

    this.logger.log(`Message updated: ${messageId}`);

    return {
      message: this.toMessageResponse(updated),
    };
  }

  /**
   * メッセージを削除する（著者本人または instructor のみ）
   * 論理削除としてテキストを「[削除済み]」に置換する
   *
   * @param userId リクエストユーザーID
   * @param messageId メッセージID
   * @throws {NotFoundException} メッセージが見つからない場合
   * @throws {ForbiddenException} 権限がない場合
   */
  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    const channel = await this.channelRepository.findById(message.channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // 著者本人 or instructor権限チェック
    const courseMember = await this.courseMemberRepository.findByUserAndCourse(
      userId,
      channel.courseId,
    );
    if (!courseMember) {
      throw new ForbiddenException('You are not a member of this course');
    }

    const isAuthor = message.authorCourseMemberId === courseMember.id;
    const isInstructor =
      courseMember.role === 'instructor_owner' ||
      courseMember.role === 'instructor';

    if (!isAuthor && !isInstructor) {
      throw new ForbiddenException(
        'You can only delete your own messages or be an instructor',
      );
    }

    // 論理削除: テキストを置換
    await this.messageRepository.update(messageId, '[削除済み]');

    this.logger.log(`Message deleted: ${messageId} by user ${userId}`);
  }

  /**
   * コースメンバーシップを確認する
   *
   * @param userId ユーザーID
   * @param courseId コースID
   * @throws {ForbiddenException} メンバーでない場合
   */
  private async validateChannelAccess(
    userId: string,
    courseId: string,
  ): Promise<void> {
    const member = await this.courseMemberRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!member) {
      throw new ForbiddenException('You are not a member of this course');
    }
  }

  /**
   * メッセージの著者であることを確認する
   *
   * @param userId ユーザーID
   * @param message メッセージ
   * @throws {ForbiddenException} 著者でない場合
   */
  private async checkMessageAuthor(
    userId: string,
    message: CourseMessage,
  ): Promise<void> {
    if (!message.authorCourseMemberId) {
      throw new ForbiddenException('System messages cannot be modified');
    }

    const channel = await this.channelRepository.findById(message.channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const courseMember = await this.courseMemberRepository.findByUserAndCourse(
      userId,
      channel.courseId,
    );

    if (!courseMember || courseMember.id !== message.authorCourseMemberId) {
      throw new ForbiddenException('You can only edit your own messages');
    }
  }

  /**
   * Prisma CourseMessage モデルから MessageResponseDto に変換する
   *
   * @param message Prisma CourseMessage
   * @returns MessageResponseDto
   */
  private toMessageResponse(message: CourseMessage): MessageResponseDto {
    return {
      id: message.id,
      channelId: message.channelId,
      threadId: message.threadId,
      authorCourseMemberId: message.authorCourseMemberId,
      text: message.text,
      isEmergency: message.isEmergency,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }
}
