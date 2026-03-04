import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminUserUseCase } from './usecases/admin-user.usecase';
import { UserRepository } from './repositories/user.repository';
import { OAuthIdentityRepository } from './repositories/oauth-identity.repository';

@Module({
  imports: [AuditModule],
  controllers: [AdminUserController],
  providers: [AdminUserUseCase, UserRepository, OAuthIdentityRepository],
  exports: [UserRepository],
})
export class AdminUserModule {}
