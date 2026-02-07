import { Module } from '@nestjs/common';
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

// Guards
import { JwtAuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * 認証モジュール（OIDC 対応版）
 *
 * 認証フロー:
 * 1. ユーザーは Keycloak ログイン画面で認証（メール/PW or Google）
 * 2. Keycloak が JWT（access token）を発行
 * 3. クライアントが Authorization: Bearer <token> で API を呼び出し
 * 4. JwtStrategy が Keycloak の JWKS で JWT を検証
 * 5. RolesGuard が JWT 内の realm_roles でロールチェック
 *
 * NestJS は JWT の発行を行わない。検証のみ。
 */
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
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
