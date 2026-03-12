import { Module } from '@nestjs/common';

// Controllers
import { UserController } from './controllers/user.controller';

// UseCases
import { GetProfileUseCase } from './usecases/get-profile.usecase';
import { UpdateProfileUseCase } from './usecases/update-profile.usecase';
import { ChangePasswordUseCase } from './usecases/change-password.usecase';

// Repositories
import { UserRepository } from './repositories/user.repository';
import { PasswordCredentialRepository } from './repositories/password-credential.repository';

@Module({
  controllers: [UserController],
  providers: [
    // UseCases
    GetProfileUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    // Repositories
    UserRepository,
    PasswordCredentialRepository,
  ],
})
export class UserModule {}
