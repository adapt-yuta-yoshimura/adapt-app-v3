import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AdminOperatorController } from './controllers/admin-operator.controller';
import { AdminOperatorUseCase } from './usecases/admin-operator.usecase';
import { OperatorRepository } from './repositories/operator.repository';

@Module({
  imports: [AuditModule],
  controllers: [AdminOperatorController],
  providers: [AdminOperatorUseCase, OperatorRepository],
  exports: [OperatorRepository],
})
export class AdminOperatorModule {}
