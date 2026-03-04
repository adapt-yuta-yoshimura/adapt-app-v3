import { Module } from '@nestjs/common';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminDashboardUseCase } from './usecases/admin-dashboard.usecase';
import { DashboardRepository } from './repositories/dashboard.repository';

@Module({
  controllers: [AdminDashboardController],
  providers: [AdminDashboardUseCase, DashboardRepository],
})
export class AdminDashboardModule {}
