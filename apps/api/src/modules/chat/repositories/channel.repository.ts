import { Injectable } from '@nestjs/common';
import {
  CourseChannel,
  CourseChannelType,
  CourseChannelPostingMode,
  CourseVisibility,
  CourseChannelMember,
  CourseChannelMemberStatus,
} from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/** チャンネル作成データ */
export interface CreateChannelData {
  courseId: string;
  type: CourseChannelType;
  postingMode?: CourseChannelPostingMode;
  visibility?: CourseVisibility;
  name?: string;
}

/** チャンネル更新データ */
export interface UpdateChannelData {
  name?: string;
  postingMode?: CourseChannelPostingMode;
  visibility?: CourseVisibility;
  isFrozen?: boolean;
  frozenAt?: Date | null;
  frozenByUserId?: string | null;
  freezeReason?: string | null;
}

/**
 * チャンネルリポジトリ
 * @see schema.prisma - CourseChannel, CourseChannelMember
 */
@Injectable()
export class ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * IDでチャンネルを取得する
   */
  async findById(id: string): Promise<CourseChannel | null> {
    return this.prisma.courseChannel.findUnique({
      where: { id },
    });
  }

  /**
   * コースIDでチャンネル一覧を取得する
   */
  async findByCourse(courseId: string): Promise<CourseChannel[]> {
    return this.prisma.courseChannel.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * チャンネルを新規作成する
   */
  async create(data: CreateChannelData): Promise<CourseChannel> {
    return this.prisma.courseChannel.create({
      data: {
        courseId: data.courseId,
        type: data.type,
        postingMode: data.postingMode ?? 'mixed',
        visibility: data.visibility ?? 'public',
        name: data.name,
      },
    });
  }

  /**
   * チャンネル情報を更新する
   */
  async update(id: string, data: UpdateChannelData): Promise<CourseChannel> {
    return this.prisma.courseChannel.update({
      where: { id },
      data,
    });
  }

  /**
   * チャンネルメンバーを取得する
   */
  async findMember(
    channelId: string,
    courseMemberId: string,
  ): Promise<CourseChannelMember | null> {
    return this.prisma.courseChannelMember.findFirst({
      where: { channelId, courseMemberId },
    });
  }

  /**
   * チャンネルメンバー一覧を取得する
   */
  async findMembers(channelId: string): Promise<CourseChannelMember[]> {
    return this.prisma.courseChannelMember.findMany({
      where: { channelId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * チャンネルメンバーを追加する
   */
  async addMember(
    channelId: string,
    courseMemberId: string,
    status: CourseChannelMemberStatus = 'joined',
  ): Promise<CourseChannelMember> {
    return this.prisma.courseChannelMember.create({
      data: {
        channelId,
        courseMemberId,
        status,
        joinedAt: status === 'joined' ? new Date() : undefined,
        invitedAt: status === 'invited' ? new Date() : undefined,
      },
    });
  }

  /**
   * チャンネルメンバーのステータスを更新する
   */
  async updateMemberStatus(
    id: string,
    status: CourseChannelMemberStatus,
  ): Promise<CourseChannelMember> {
    const updateData: Record<string, unknown> = { status };
    if (status === 'joined') {
      updateData.joinedAt = new Date();
    } else if (status === 'declined') {
      updateData.declinedAt = new Date();
    }

    return this.prisma.courseChannelMember.update({
      where: { id },
      data: updateData,
    });
  }
}
