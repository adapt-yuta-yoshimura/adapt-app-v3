import { Module } from '@nestjs/common';
import { InstructorCourseModule } from '../instructor-course/instructor-course.module';
import { ChannelController } from './channel.controller';
import { MessageController } from './message.controller';
import { ChannelUseCase } from './channel.usecase';
import { MessageUseCase } from './message.usecase';
import { ChannelRepository } from './channel.repository';
import { ThreadRepository } from './thread.repository';
import { MessageRepository } from './message.repository';

/**
 * コミュニケーションモジュール
 *
 * INS-03チケット: API-049〜058
 * PrismaModule / AuthModule は @Global() のため imports 不要
 * InstructorCourseModule: CourseMemberRepository / CourseRepository を利用
 */
@Module({
  imports: [InstructorCourseModule],
  controllers: [ChannelController, MessageController],
  providers: [
    ChannelUseCase,
    MessageUseCase,
    ChannelRepository,
    ThreadRepository,
    MessageRepository,
  ],
  exports: [MessageRepository, ThreadRepository],
})
export class CommunicationModule {}
