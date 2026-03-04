import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { AdminUserUseCase } from '../usecases/admin-user.usecase';
import type {
  UserListResponse,
  UserAdminView,
  UserResponse,
  SuccessResponse,
} from '../usecases/admin-user.usecase';

/**
 * ユーザー管理コントローラ（Admin）
 *
 * ADMIN-02チケット: 受講者・講師の一覧、招待、編集、凍結/解除、論理削除
 * SoT: openapi_admin.yaml - API-ADMIN-09〜14
 */
@Controller('api/v1/admin/users')
@UseGuards(AuthGuard, RolesGuard)
export class AdminUserController {
  constructor(private readonly usecase: AdminUserUseCase) {}

  /**
   * API-ADMIN-09: 全ユーザー一覧
   * GET /api/v1/admin/users
   * x-roles: operator, root_operator
   */
  @Get()
  @Roles('operator', 'root_operator')
  async listUsers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('globalRole') globalRole?: 'learner' | 'instructor',
    @Query('isActive') isActiveStr?: string,
    @Query('includeDeleted') includeDeletedStr?: string,
    @Query('page') pageStr?: string,
    @Query('perPage') perPageStr?: string,
  ): Promise<UserListResponse> {
    const isActive =
      isActiveStr === undefined
        ? undefined
        : isActiveStr === 'true';
    const includeDeleted = includeDeletedStr === 'true';
    const page = pageStr ? parseInt(pageStr, 10) : undefined;
    const perPage = perPageStr ? parseInt(perPageStr, 10) : undefined;
    return this.usecase.listUsers(user.userId, {
      globalRole: globalRole as 'learner' | 'instructor' | undefined,
      isActive,
      includeDeleted: includeDeleted || undefined,
      page: page && !Number.isNaN(page) ? page : undefined,
      perPage: perPage && !Number.isNaN(perPage) ? perPage : undefined,
    });
  }

  /**
   * API-ADMIN-10: ユーザー招待（受講者/講師）
   * POST /api/v1/admin/users
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG
   */
  @Post()
  @Roles('operator', 'root_operator')
  @HttpCode(HttpStatus.CREATED)
  async inviteUser(
    @CurrentUser() user: AuthenticatedUser,
    @Body()
    body: { email: string; name: string; globalRole: 'learner' | 'instructor' },
  ): Promise<UserAdminView> {
    return this.usecase.inviteUser(
      user.userId,
      user.globalRole as 'operator' | 'root_operator',
      { email: body.email, name: body.name, globalRole: body.globalRole },
    );
  }

  /**
   * API-ADMIN-11: ユーザー編集
   * PATCH /api/v1/admin/users/{userId}
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG
   */
  @Patch(':userId')
  @Roles('operator', 'root_operator')
  async updateUser(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body()
    body: {
      email?: string;
      name?: string;
      globalRole?: 'learner' | 'instructor';
      isActive?: boolean;
    },
  ): Promise<UserResponse> {
    return this.usecase.updateUser(
      user.userId,
      user.globalRole as 'operator' | 'root_operator',
      userId,
      body,
    );
  }

  /**
   * API-ADMIN-12: ユーザー論理削除
   * DELETE /api/v1/admin/users/{userId}
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG
   */
  @Delete(':userId')
  @Roles('operator', 'root_operator')
  async deleteUser(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse> {
    return this.usecase.deleteUser(
      user.userId,
      user.globalRole as 'operator' | 'root_operator',
      userId,
    );
  }

  /**
   * API-ADMIN-13: ユーザー凍結(BAN)
   * POST /api/v1/admin/users/{userId}/freeze
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG
   * requestBody: GenericWriteRequest（OpenAPI 必須）
   */
  @Post(':userId/freeze')
  @Roles('operator', 'root_operator')
  @HttpCode(HttpStatus.CREATED)
  async freezeUser(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() _body: Record<string, unknown>,
  ): Promise<SuccessResponse> {
    return this.usecase.freezeUser(
      user.userId,
      user.globalRole as 'operator' | 'root_operator',
      userId,
    );
  }

  /**
   * API-ADMIN-14: ユーザー凍結解除
   * POST /api/v1/admin/users/{userId}/unfreeze
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG
   * requestBody: GenericWriteRequest（OpenAPI 必須）
   */
  @Post(':userId/unfreeze')
  @Roles('operator', 'root_operator')
  @HttpCode(HttpStatus.CREATED)
  async unfreezeUser(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() _body: Record<string, unknown>,
  ): Promise<SuccessResponse> {
    return this.usecase.unfreezeUser(
      user.userId,
      user.globalRole as 'operator' | 'root_operator',
      userId,
    );
  }
}
