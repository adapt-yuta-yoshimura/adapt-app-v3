import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { AdminCourseUseCase } from '../usecases/admin-course.usecase';

/**
 * 監査コントローラ（Admin）
 *
 * ADMIN-04チケット: 凍結講座の監査閲覧
 * SoT: openapi_admin.yaml - API-ADMIN-08
 *
 * パスが /api/v1/admin/audit/courses/... のため別コントローラとして分離
 */
@Controller('api/v1/admin/audit/courses')
@UseGuards(AuthGuard, RolesGuard)
export class AdminAuditController {
  constructor(private readonly usecase: AdminCourseUseCase) {}

  /**
   * API-ADMIN-08: [監査]凍結講座閲覧
   * GET /api/v1/admin/audit/courses/{courseId}
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG(強制)
   */
  @Get(':courseId')
  @Roles('operator', 'root_operator')
  async auditCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminCourseUseCase.auditCourse
    // Response: GenericDetailView
    // 処理: 凍結中の秘匿コンテンツ精査、閲覧ログ強制記録
    throw new Error('Not implemented');
  }
}
