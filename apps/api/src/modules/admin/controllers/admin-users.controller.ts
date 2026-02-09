import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import type { paths, components } from '../../../generated';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ValidatedUser } from '../../auth/strategies/jwt.strategy';
import { ListUsersUseCase } from '../usecases/list-users.usecase';
import { FreezeUserUseCase } from '../usecases/freeze-user.usecase';
import { UnfreezeUserUseCase } from '../usecases/unfreeze-user.usecase';

type UserListResponse =
  paths['/api/v1/admin/users']['get']['responses']['200']['content']['application/json'];
type FreezeUserResponse =
  paths['/api/v1/admin/users/{userId}/freeze']['post']['responses']['201']['content']['application/json'];
type UnfreezeUserResponse =
  paths['/api/v1/admin/users/{userId}/unfreeze']['post']['responses']['201']['content']['application/json'];
type GenericWriteRequest = components['schemas']['GenericWriteRequest'];

/**
 * Admin ユーザー管理 API
 * API-074: 全ユーザー一覧, API-075: ユーザー凍結, API-075B: ユーザー凍結解除
 */
@Controller('api/v1/admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('operator', 'root_operator')
export class AdminUsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly freezeUserUseCase: FreezeUserUseCase,
    private readonly unfreezeUserUseCase: UnfreezeUserUseCase,
  ) {}

  /**
   * GET /api/v1/admin/users
   * API-074: 全ユーザー一覧
   */
  @Get()
  async listUsers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<UserListResponse> {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : undefined;
    return this.listUsersUseCase.execute(
      Number.isNaN(pageNum) ? undefined : pageNum,
      Number.isNaN(pageSizeNum) ? undefined : pageSizeNum,
    );
  }

  /**
   * POST /api/v1/admin/users/:userId/freeze
   * API-075: ユーザー凍結(BAN)
   */
  @Post(':userId/freeze')
  @HttpCode(HttpStatus.CREATED)
  async freezeUser(
    @CurrentUser() user: ValidatedUser,
    @Param('userId') userId: string,
    @Body() body: GenericWriteRequest,
  ): Promise<FreezeUserResponse> {
    const reason =
      typeof body === 'object' && body !== null && 'reason' in body
        ? (body as { reason?: string }).reason
        : undefined;
    return this.freezeUserUseCase.execute(user, userId, { reason });
  }

  /**
   * POST /api/v1/admin/users/:userId/unfreeze
   * API-075B: ユーザー凍結解除
   */
  @Post(':userId/unfreeze')
  @HttpCode(HttpStatus.CREATED)
  async unfreezeUser(
    @CurrentUser() user: ValidatedUser,
    @Param('userId') userId: string,
    @Body() body: GenericWriteRequest,
  ): Promise<UnfreezeUserResponse> {
    const reason =
      typeof body === 'object' && body !== null && 'reason' in body
        ? (body as { reason?: string }).reason
        : undefined;
    return this.unfreezeUserUseCase.execute(user, userId, { reason });
  }
}
