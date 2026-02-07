import {
  Controller,
  Get,
  Post,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ValidatedUser } from '../strategies/jwt.strategy';

/**
 * 認証コントローラー（OIDC 対応版）
 *
 * 認証は Keycloak が担当するため、NestJS 側のエンドポイントは最小限:
 * - GET /api/v1/auth/me - 認証済みユーザー情報を返す
 * - POST /api/v1/auth/logout - ログアウト（クライアント側でトークン破棄）
 *
 * 以下は Keycloak が担当（NestJS にエンドポイント不要）:
 * - ログイン（メール/PW）
 * - Google OAuth
 * - トークン発行・リフレッシュ
 */
@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  /**
   * GET /api/v1/auth/me
   * Keycloak JWT から取得したユーザー情報を返す
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: ValidatedUser) {
    return {
      keycloakId: user.keycloakId,
      email: user.email,
      name: user.name,
      globalRole: user.globalRole,
    };
  }

  /**
   * POST /api/v1/auth/logout
   * ログアウト処理
   * Keycloak のセッション終了はクライアント側で Keycloak の logout endpoint を呼ぶ
   * サーバー側は将来的な Redis ブラックリスト用に残す
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: ValidatedUser) {
    this.logger.log(`User logged out: ${user.keycloakId}`);
    return { message: 'Logged out successfully' };
  }
}
