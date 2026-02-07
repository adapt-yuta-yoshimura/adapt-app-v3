import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CourseChannel } from '@prisma/client';

import { ChannelRepository, CreateChannelData, UpdateChannelData } from '../repositories/channel.repository';
import { CourseMemberRepository } from '../../course/repositories/course-member.repository';
import { CourseRepository } from '../../course/repositories/course.repository';

/** チャンネルレスポンスDTO */
export interface ChannelResponseDto {
  id: string;
  courseId: string;
  type: string;
  postingMode: string;
  visibility: string;
  name: string | null;
  isFrozen: boolean;
  frozenAt: string | null;
  frozenByUserId: string | null;
  freezeReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/** チャンネル一覧レスポンスDTO */
export interface ChannelListResponseDto {
  channels: ChannelResponseDto[];
}

/** チャンネル詳細レスポンスDTO */
export interface ChannelDetailResponseDto {
  channel: ChannelResponseDto;
}

/**
 * チャンネルサービス
 * チャンネルのCRUDおよびメンバー管理のビジネスロジックを担当する
 * Prismaには直接依存せず、Repository層を通じてデータアクセスする
 */
@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly courseRepository: CourseRepository,
    private readonly courseMemberRepository: CourseMemberRepository,
  ) {}

  /**
   * コース内のチャンネル一覧を取得する
   *
   * @param userId リクエストユーザーID
   * @param courseId コースID
   * @returns チャンネル一覧レスポンス
   * @throws {NotFoundException} コースが見つからない場合
   * @throws {ForbiddenException} コースメンバーでない場合
   */
  async getChannels(
    userId: string,
    courseId: string,
  ): Promise<ChannelListResponseDto> {
    await this.validateCourseAccess(userId, courseId);

    const channels = await this.channelRepository.findByCourse(courseId);

    return {
      channels: channels.map((ch) => this.toChannelResponse(ch)),
    };
  }

  /**
   * チャンネルを新規作成する
   *
   * @param userId 作成者ユーザーID
   * @param courseId コースID
   * @param data チャンネル作成データ
   * @returns 作成されたチャンネル詳細
   * @throws {NotFoundException} コースが見つからない場合
   * @throws {ForbiddenException} 権限がない場合、または凍結中の場合
   */
  async createChannel(
    userId: string,
    courseId: string,
    data: Omit<CreateChannelData, 'courseId'>,
  ): Promise<ChannelDetailResponseDto> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // 凍結チェック
    if (course.isFrozen) {
      throw new ForbiddenException('Course is frozen and cannot be modified');
    }

    // instructor_owner / instructor のみチャンネル作成可能
    await this.checkInstructorPermission(userId, courseId);

    const channel = await this.channelRepository.create({
      ...data,
      courseId,
    });

    this.logger.log(`Channel created: ${channel.id} in course ${courseId}`);

    return {
      channel: this.toChannelResponse(channel),
    };
  }

  /**
   * チャンネル情報を更新する
   *
   * @param userId リクエストユーザーID
   * @param channelId チャンネルID
   * @param data チャンネル更新データ
   * @returns 更新されたチャンネル詳細
   * @throws {NotFoundException} チャンネルが見つからない場合
   * @throws {ForbiddenException} 権限がない場合、または凍結中の場合
   */
  async updateChannel(
    userId: string,
    channelId: string,
    data: UpdateChannelData,
  ): Promise<ChannelDetailResponseDto> {
    const channel = await this.channelRepository.findById(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${channelId} not found`);
    }

    // チャンネル凍結チェック
    if (channel.isFrozen) {
      throw new ForbiddenException('Channel is frozen and cannot be modified');
    }

    // instructor_owner / instructor のみ更新可能
    await this.checkInstructorPermission(userId, channel.courseId);

    const updated = await this.channelRepository.update(channelId, data);

    this.logger.log(`Channel updated: ${channelId}`);

    return {
      channel: this.toChannelResponse(updated),
    };
  }

  /**
   * チャンネルを論理削除する（凍結状態にする）
   *
   * @param userId リクエストユーザーID
   * @param channelId チャンネルID
   * @throws {NotFoundException} チャンネルが見つからない場合
   * @throws {ForbiddenException} 権限がない場合
   */
  async deleteChannel(userId: string, channelId: string): Promise<void> {
    const channel = await this.channelRepository.findById(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${channelId} not found`);
    }

    // instructor_owner のみ削除可能
    const member = await this.courseMemberRepository.findByUserAndCourse(
      userId,
      channel.courseId,
    );
    if (!member || member.role !== 'instructor_owner') {
      throw new ForbiddenException(
        'Only the course owner can delete channels',
      );
    }

    await this.channelRepository.update(channelId, {
      isFrozen: true,
      frozenAt: new Date(),
      frozenByUserId: userId,
      freezeReason: 'Channel deleted by instructor',
    });

    this.logger.log(`Channel deleted (frozen): ${channelId} by user ${userId}`);
  }

  /**
   * コースメンバーシップを確認する
   *
   * @param userId ユーザーID
   * @param courseId コースID
   * @throws {NotFoundException} コースが見つからない場合
   * @throws {ForbiddenException} メンバーでない場合
   */
  private async validateCourseAccess(
    userId: string,
    courseId: string,
  ): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const member = await this.courseMemberRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!member) {
      throw new ForbiddenException('You are not a member of this course');
    }
  }

  /**
   * instructor / instructor_owner 権限を確認する
   *
   * @param userId ユーザーID
   * @param courseId コースID
   * @throws {ForbiddenException} instructor権限がない場合
   */
  private async checkInstructorPermission(
    userId: string,
    courseId: string,
  ): Promise<void> {
    const member = await this.courseMemberRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    if (
      !member ||
      (member.role !== 'instructor_owner' && member.role !== 'instructor')
    ) {
      throw new ForbiddenException(
        'Only instructors can perform this action',
      );
    }
  }

  /**
   * Prisma CourseChannel モデルから ChannelResponseDto に変換する
   *
   * @param channel Prisma CourseChannel
   * @returns ChannelResponseDto
   */
  private toChannelResponse(channel: CourseChannel): ChannelResponseDto {
    return {
      id: channel.id,
      courseId: channel.courseId,
      type: channel.type,
      postingMode: channel.postingMode,
      visibility: channel.visibility,
      name: channel.name,
      isFrozen: channel.isFrozen,
      frozenAt: channel.frozenAt?.toISOString() ?? null,
      frozenByUserId: channel.frozenByUserId,
      freezeReason: channel.freezeReason,
      createdAt: channel.createdAt.toISOString(),
      updatedAt: channel.updatedAt.toISOString(),
    };
  }
}
