import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './common/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminUserModule } from './modules/admin-user/admin-user.module';
import { AdminOperatorModule } from './modules/admin-operator/admin-operator.module';
import { AdminCourseModule } from './modules/admin-course/admin-course.module';
import { AdminPaymentModule } from './modules/admin-payment/admin-payment.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { InstructorCourseModule } from './modules/instructor-course/instructor-course.module';
import { InstructorOperationsModule } from './modules/instructor-operations/instructor-operations.module';
import { CommunicationModule } from './modules/communication/communication.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AuditModule,
    AdminUserModule,
    AdminOperatorModule,
    AdminCourseModule,
    AdminPaymentModule,
    AdminDashboardModule,
    InstructorCourseModule,
    InstructorOperationsModule,
    CommunicationModule,
  ],
})
export class AppModule {}
