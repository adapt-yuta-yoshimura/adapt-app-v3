import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaService } from '../../common/prisma/prisma.service';

// Controllers
import { AuthController } from './controllers/auth.controller';

// Services
import { AuthService } from './services/auth.service';
import { JwtTokenService } from './services/jwt.service';

// Repositories
import { UserRepository } from './repositories/user.repository';
import { OAuthIdentityRepository } from './repositories/oauth-identity.repository';
import { PasswordCredentialRepository } from './repositories/password-credential.repository';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

// Guards
import { JwtAuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * 認証モジュール
 *
 * 提供する機能:
 * - JWT認証（access token / refresh token）
 * - Google OAuth 2.0 / OIDC
 * - ロールベース認可
 *
 * エクスポート:
 * - JwtAuthGuard: 他モジュールで認証チェックに使用
 * - RolesGuard: 他モジュールでロールチェックに使用
 * - AuthService: 他モジュールでユーザー検証に使用
 * - JwtTokenService: 他モジュールでトークン操作に使用
 * - UserRepository: 他モジュールでユーザー取得に使用
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'default-secret-change-me',
      signOptions: {
        algorithm: 'HS256',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Services
    AuthService,
    JwtTokenService,

    // Repositories
    PrismaService,
    UserRepository,
    OAuthIdentityRepository,
    PasswordCredentialRepository,

    // Strategies
    JwtStrategy,
    GoogleStrategy,

    // Guards
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    JwtTokenService,
    JwtAuthGuard,
    RolesGuard,
    UserRepository,
  ],
})
export class AuthModule {}
