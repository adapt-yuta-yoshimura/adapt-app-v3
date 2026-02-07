import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Res,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthService, AuthResponse, GoogleProfile } from '../services/auth.service';
import { JwtPayload } from '../services/jwt.service';
import { JwtAuthGuard } from '../guards/auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

/** ログインリクエストDTO */
interface LoginDto {
  email: string;
  password: string;
}

/** リフレッシュリクエストDTO */
interface RefreshDto {
  refreshToken: string;
}

/**
 * 認証コントローラー
 *
 * エンドポイント:
 * - POST /api/v1/auth/login      - メール/パスワードログイン
 * - POST /api/v1/auth/logout     - ログアウト
 * - POST /api/v1/auth/refresh    - トークンリフレッシュ
 * - GET  /api/v1/auth/google     - Google OAuth開始
 * - GET  /api/v1/auth/google/callback - Google OAuthコールバック
 */
@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * メールアドレスとパスワードでログインする
   */
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto.email, dto.password);
  }

  /**
   * POST /api/v1/auth/logout
   * ログアウト処理（認証必須）
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.authService.logout(user.sub);
    return { message: 'Logged out successfully' };
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh tokenを使ってトークンペアを再発行する
   */
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto): Promise<AuthResponse> {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  /**
   * GET /api/v1/auth/google
   * Google OAuth認証フローを開始する
   * PassportのGoogleStrategyにリダイレクトされる
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(): Promise<void> {
    // GoogleAuthGuard がGoogleのOAuthページにリダイレクトする
  }

  /**
   * GET /api/v1/auth/google/callback
   * Google OAuth認証コールバック
   * 認証成功後、フロントエンドにリダイレクトする
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() profile: GoogleProfile,
    @Res() res: Response,
  ): Promise<void> {
    const authResponse = await this.authService.handleGoogleCallback(profile);

    // フロントエンドにトークンを渡すためリダイレクト
    const appUrl = process.env.APP_URL ?? 'http://app.localhost.adapt:3000';
    const redirectUrl = new URL('/auth/callback', appUrl);
    redirectUrl.searchParams.set('accessToken', authResponse.accessToken);
    redirectUrl.searchParams.set('refreshToken', authResponse.refreshToken);

    this.logger.log(`Google OAuth callback completed for user: ${authResponse.user.id}`);

    res.redirect(redirectUrl.toString());
  }
}
