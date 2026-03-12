import { Module } from '@nestjs/common';
import { StoreCourseController } from './store-course.controller';
import { StoreApplyController } from './store-apply.controller';
import { PaymentController } from './payment.controller';
import { StoreCourseUseCase } from './store-course.usecase';
import { StoreApplyUseCase } from './store-apply.usecase';
import { PaymentUseCase } from './payment.usecase';
import { StoreCourseRepository } from './store-course.repository';
import { EnrollmentRepository } from './enrollment.repository';
import { PaymentRepository } from './payment.repository';

/**
 * Store/Payment モジュール（ストア公開ページ + 決済）
 *
 * STU系チケット: API-009〜012
 * - 講座一覧/詳細（公開・guest可）
 * - 講座申込
 * - Stripe決済セッション生成
 *
 * PrismaModule / AuthModule は @Global() のため imports 不要
 */
@Module({
  controllers: [
    StoreCourseController,
    StoreApplyController,
    PaymentController,
  ],
  providers: [
    StoreCourseUseCase,
    StoreApplyUseCase,
    PaymentUseCase,
    StoreCourseRepository,
    EnrollmentRepository,
    PaymentRepository,
  ],
  exports: [EnrollmentRepository],
})
export class StoreModule {}
