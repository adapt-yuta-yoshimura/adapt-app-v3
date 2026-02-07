import { Module } from '@nestjs/common';

import { PrismaService } from './common/prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from './modules/course/course.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { SubmissionModule } from './modules/submission/submission.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CourseModule,
    LessonModule,
    AssignmentModule,
    SubmissionModule,
    ChatModule,
    PaymentModule,
    AdminModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
