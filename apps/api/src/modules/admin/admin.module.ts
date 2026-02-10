import { Module } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminOperatorsController } from './controllers/admin-operators.controller';
import { AdminUserRepository } from './repositories/admin-user.repository';
import { AdminOperatorRepository } from './repositories/admin-operator.repository';
import { AuditEventRepository } from './repositories/audit-event.repository';
import { ListUsersUseCase } from './usecases/list-users.usecase';
import { FreezeUserUseCase } from './usecases/freeze-user.usecase';
import { UnfreezeUserUseCase } from './usecases/unfreeze-user.usecase';
import { ListOperatorsUseCase } from './usecases/list-operators.usecase';
import { AddOperatorUseCase } from './usecases/add-operator.usecase';

@Module({
  imports: [AuthModule],
  controllers: [AdminUsersController, AdminOperatorsController],
  providers: [
    PrismaService,
    AdminUserRepository,
    AdminOperatorRepository,
    AuditEventRepository,
    ListUsersUseCase,
    FreezeUserUseCase,
    UnfreezeUserUseCase,
    ListOperatorsUseCase,
    AddOperatorUseCase,
  ],
  exports: [],
})
export class AdminModule {}
