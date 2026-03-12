import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { GetProfileUseCase } from '../usecases/get-profile.usecase';
import { UpdateProfileUseCase } from '../usecases/update-profile.usecase';
import { ChangePasswordUseCase } from '../usecases/change-password.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---

// API-001
type GetProfileResponse =
  paths['/api/v1/users/me']['get']['responses']['200']['content']['application/json'];

// API-002
type UpdateProfileRequest =
  paths['/api/v1/users/me']['put']['requestBody']['content']['application/json'];
type UpdateProfileResponse =
  paths['/api/v1/users/me']['put']['responses']['200']['content']['application/json'];

// API-003
type ChangePasswordRequest =
  paths['/api/v1/users/me/password']['put']['requestBody']['content']['application/json'];
type ChangePasswordResponse =
  paths['/api/v1/users/me/password']['put']['responses']['200']['content']['application/json'];

/**
 * ユーザープロフィール Controller
 *
 * API-001: GET  /api/v1/users/me          - プロフィール取得
 * API-002: PUT  /api/v1/users/me          - プロフィール更新
 * API-003: PUT  /api/v1/users/me/password - パスワード変更
 *
 * x-roles: all（認証済みユーザー全員）
 * ガード: AuthGuard のみ（RolesGuard なし）
 */
@Controller('api/v1/users/me')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  /**
   * API-001: プロフィール取得
   * GET /api/v1/users/me
   * x-roles: all
   * x-policy: '-'
   */
  @Get()
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GetProfileResponse> {
    // TODO(TBD): Cursor実装 - GetProfileUseCase.execute
    return this.getProfileUseCase.execute(user.userId);
  }

  /**
   * API-002: プロフィール更新
   * PUT /api/v1/users/me
   * x-roles: all
   * x-policy: '-'
   */
  @Put()
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> {
    // TODO(TBD): Cursor実装 - UpdateProfileUseCase.execute
    return this.updateProfileUseCase.execute(user.userId, body);
  }

  /**
   * API-003: パスワード変更
   * PUT /api/v1/users/me/password
   * x-roles: all
   * x-policy: '-'
   */
  @Put('password')
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> {
    // TODO(TBD): Cursor実装 - ChangePasswordUseCase.execute
    return this.changePasswordUseCase.execute(user.userId, body);
  }
}
