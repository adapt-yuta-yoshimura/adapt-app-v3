import { Module } from '@nestjs/common';
import { AdminPaymentController } from './controllers/admin-payment.controller';
import { AdminPaymentUseCase } from './usecases/admin-payment.usecase';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  controllers: [AdminPaymentController],
  providers: [AdminPaymentUseCase, PaymentRepository],
})
export class AdminPaymentModule {}
