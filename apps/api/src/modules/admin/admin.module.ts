import { Module } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminUserRepository } from './repositories/admin-user.repository';
import { AuditEventRepository } from './repositories/audit-event.repository';
import { ListUsersUseCase } from './usecases/list-users.usecase';
import { FreezeUserUseCase } from './usecases/freeze-user.usecase';
import { UnfreezeUserUseCase } from './usecases/unfreeze-user.usecase';

@Module({
  imports: [AuthModule],
  controllers: [AdminUsersController],
  providers: [
    PrismaService,
    AdminUserRepository,
    AuditEventRepository,
    ListUsersUseCase,
    FreezeUserUseCase,
    UnfreezeUserUseCase,
  ],
  exports: [],
})
export class AdminModule {}
