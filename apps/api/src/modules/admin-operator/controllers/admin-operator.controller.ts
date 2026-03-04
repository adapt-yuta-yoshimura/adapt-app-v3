import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { AdminOperatorUseCase } from '../usecases/admin-operator.usecase';

// TODO(TBD): pnpm generate:types 実行後、以下の型を openapi-admin 生成型に置換
// import type { paths } from '@adapt/types/openapi-admin';
// type OperatorListResponse = paths['/api/v1/admin/operators']['get']['responses']['200']['content']['application/json'];
// ...

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
  async listOperators(@CurrentUser() user: AuthenticatedUser): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminOperatorUseCase.listOperators
    // Response: OperatorListResponse（items: OperatorAdminView[], meta: ListMeta）
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-16: 運営スタッフ招待
   * POST /api/v1/admin/operators
   * x-roles: root_operator
   * x-policy: AUDIT_LOG
   */
  @Post()
  @Roles('root_operator')
  async inviteOperator(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminOperatorUseCase.inviteOperator
    // Request: OperatorInviteRequest（email, name, globalRole: operator|root_operator）
    // Response: 201 OperatorAdminView / 409
    // 処理: Keycloakユーザー作成 → 招待メール送信
    throw new Error('Not implemented');
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
    @Body() body: unknown,
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminOperatorUseCase.updateOperator
    // Request: OperatorUpdateRequest（globalRole: operator|root_operator）
    // Response: 200 OperatorAdminView / 404
    throw new Error('Not implemented');
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
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminOperatorUseCase.deleteOperator
    // Response: 200 SuccessResponse / 404
    // 処理: deletedAt + isActive=false（globalRole は保持）
    throw new Error('Not implemented');
  }
}
