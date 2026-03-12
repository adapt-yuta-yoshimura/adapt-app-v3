import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/jwt.types';
import { UserProfileUseCase } from './user-profile.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type UserMeView =
  paths['/api/v1/users/me']['get']['responses']['200']['content']['application/json'];
type UserUpdateRequest =
  paths['/api/v1/users/me']['put']['requestBody']['content']['application/json'];
type UserUpdateResponse =
  paths['/api/v1/users/me']['put']['responses']['200']['content']['application/json'];
type PasswordChangeBody =
  paths['/api/v1/users/me/password']['put']['requestBody']['content']['application/json'];
type PasswordChangeResponse =
  paths['/api/v1/users/me/password']['put']['responses']['200']['content']['application/json'];

/**
 * ユーザープロフィールコントローラ
 *
 * API-001: プロフィール取得
 * API-002: プロフィール更新
 * API-003: パスワード変更
 * SoT: openapi_app.yaml
 */
@Controller('api/v1/users')
@UseGuards(AuthGuard, RolesGuard)
export class UserProfileController {
  constructor(private readonly usecase: UserProfileUseCase) {}

  /**
   * API-001: プロフィール取得
   * GET /api/v1/users/me
   * x-roles: all
   */
  @Get('me')
  async getMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserMeView> {
    return this.usecase.getMe(user.userId);
  }

  /**
   * API-002: プロフィール更新
   * PUT /api/v1/users/me
   * x-roles: all
   */
  @Put('me')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UserUpdateRequest,
  ): Promise<UserUpdateResponse> {
    return this.usecase.updateProfile(user.userId, body);
  }

  /**
   * API-003: パスワード変更
   * PUT /api/v1/users/me/password
   * x-roles: all
   */
  @Put('me/password')
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: PasswordChangeBody,
  ): Promise<PasswordChangeResponse> {
    return this.usecase.changePassword(user.userId, body);
  }
}
