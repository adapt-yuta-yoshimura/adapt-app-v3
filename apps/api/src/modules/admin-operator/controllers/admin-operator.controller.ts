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
import { AdminOperatorUseCase } from '../usecases/admin-operator.usecase';
import type {
  OperatorListResponse,
  OperatorAdminView,
  SuccessResponse,
} from '../usecases/admin-operator.usecase';

/**
 * 運営スタッフ管理コントローラ（Admin）
 *
 * ADMIN-03チケット: 運営スタッフの一覧、招待、編集、削除
 * SoT: openapi_admin.yaml - API-ADMIN-15〜18
 * x-roles: root_operator のみ（全エンドポイント）
 */
@Controller('api/v1/admin/operators')
@UseGuards(AuthGuard, RolesGuard)
export class AdminOperatorController {
  constructor(private readonly usecase: AdminOperatorUseCase) {}

  /**
   * API-ADMIN-15: 運営スタッフ一覧
   * GET /api/v1/admin/operators
   * x-roles: root_operator
   */
  @Get()
  @Roles('root_operator')
  async listOperators(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') pageStr?: string,
    @Query('perPage') perPageStr?: string,
  ): Promise<OperatorListResponse> {
    const page = pageStr ? parseInt(pageStr, 10) : undefined;
    const perPage = perPageStr ? parseInt(perPageStr, 10) : undefined;
    return this.usecase.listOperators(user.userId, {
      page: page && !Number.isNaN(page) ? page : undefined,
      perPage: perPage && !Number.isNaN(perPage) ? perPage : undefined,
    });
  }

  /**
   * API-ADMIN-16: 運営スタッフ招待
   * POST /api/v1/admin/operators
   * x-roles: root_operator
   * x-policy: AUDIT_LOG
   */
  @Post()
  @Roles('root_operator')
  @HttpCode(HttpStatus.CREATED)
  async inviteOperator(
    @CurrentUser() user: AuthenticatedUser,
    @Body()
    body: { email: string; name: string; globalRole: 'operator' | 'root_operator' },
  ): Promise<OperatorAdminView> {
    return this.usecase.inviteOperator(
      user.userId,
      user.globalRole as 'root_operator',
      { email: body.email, name: body.name, globalRole: body.globalRole },
    );
  }

  /**
   * API-ADMIN-17: 運営スタッフ編集（ロール変更）
   * PATCH /api/v1/admin/operators/{userId}
   * x-roles: root_operator
   * x-policy: AUDIT_LOG
   */
  @Patch(':userId')
  @Roles('root_operator')
  async updateOperator(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body()
    body: { globalRole: 'operator' | 'root_operator' },
  ): Promise<OperatorAdminView> {
    return this.usecase.updateOperator(
      user.userId,
      user.globalRole as 'root_operator',
      userId,
      { globalRole: body.globalRole },
    );
  }

  /**
   * API-ADMIN-18: 運営スタッフ削除（論理削除）
   * DELETE /api/v1/admin/operators/{userId}
   * x-roles: root_operator
   * x-policy: AUDIT_LOG
   */
  @Delete(':userId')
  @Roles('root_operator')
  async deleteOperator(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse> {
    return this.usecase.deleteOperator(
      user.userId,
      user.globalRole as 'root_operator',
      userId,
    );
  }
}
