import { Module } from '@nestjs/common';
import { EnrollmentController } from './controllers/enrollment.controller';
import { ApplyCourseUseCase } from './usecases/apply-course.usecase';
import { CreateCheckoutUseCase } from './usecases/create-checkout.usecase';
import { CourseEnrollmentRepository } from './repositories/course-enrollment.repository';
import { OrderRepository } from './repositories/order.repository';
import { PaymentRepository } from './repositories/payment.repository';
import { StoreModule } from '../store/store.module';

/**
 * Enrollment モジュール（申込・決済）
 *
 * STU-01: API-011〜012
 * - 講座申込(開始)
 * - Stripe Checkout セッション生成
 *
 * PrismaModule / AuthModule は @Global() のため imports 不要
 * StoreModule を import して StoreCourseRepository を利用
 */
@Module({
  imports: [StoreModule],
  controllers: [EnrollmentController],
  providers: [
    ApplyCourseUseCase,
    CreateCheckoutUseCase,
    CourseEnrollmentRepository,
    OrderRepository,
    PaymentRepository,
  ],
  exports: [CourseEnrollmentRepository],
})
export class EnrollmentModule {}
