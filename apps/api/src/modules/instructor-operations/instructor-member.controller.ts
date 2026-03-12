import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/jwt.types';
import { InstructorMemberUseCase } from './instructor-member.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type MemberListResponse =
  paths['/api/v1/instructor/courses/{courseId}/members']['get']['responses']['200']['content']['application/json'];
type RoleChangeBody =
  paths['/api/v1/instructor/courses/{courseId}/members/{userId}/role']['patch']['requestBody']['content']['application/json'];
type RoleChangeResponse =
  paths['/api/v1/instructor/courses/{courseId}/members/{userId}/role']['patch']['responses']['200']['content']['application/json'];
type RevokeBody =
  paths['/api/v1/instructor/courses/{courseId}/members/{userId}/revoke']['post']['requestBody']['content']['application/json'];
type RevokeResponse =
  paths['/api/v1/instructor/courses/{courseId}/members/{userId}/revoke']['post']['responses']['201']['content']['application/json'];
type ExportResponse =
  paths['/api/v1/instructor/courses/{courseId}/export']['get']['responses']['200']['content']['application/json'];

/**
 * 受講者管理コントローラ（講師向け）
 *
 * API-045: GET   /api/v1/instructor/courses/{courseId}/members — 受講者名簿取得
 * API-046: PATCH /api/v1/instructor/courses/{courseId}/members/{userId}/role — 講座内ロール変更
 * API-047: POST  /api/v1/instructor/courses/{courseId}/members/{userId}/revoke — 受講権限剥奪
 * API-048: GET   /api/v1/instructor/courses/{courseId}/export — 受講者CSV出力
 */
@Controller('api/v1/instructor')
@UseGuards(AuthGuard, RolesGuard)
export class InstructorMemberController {
  constructor(private readonly usecase: InstructorMemberUseCase) {}

  /** API-045: 受講者名簿取得 */
  @Get('courses/:courseId/members')
  @Roles('instructor')
  async getMembers(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<MemberListResponse> {
    return this.usecase.getMembers(courseId, user.userId);
  }

  /** API-046: 講座内ロール変更 */
  @Patch('courses/:courseId/members/:userId/role')
  @Roles('instructor')
  async changeRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Param('userId') targetUserId: string,
    @Body() body: RoleChangeBody,
  ): Promise<RoleChangeResponse> {
    return this.usecase.changeRole(courseId, targetUserId, body, user.userId);
  }

  /** API-047: 受講権限剥奪 */
  @Post('courses/:courseId/members/:userId/revoke')
  @Roles('instructor')
  async revokeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Param('userId') targetUserId: string,
    @Body() _body: RevokeBody,
  ): Promise<RevokeResponse> {
    return this.usecase.revoke(courseId, targetUserId, user.userId);
  }

  /** API-048: 受講者CSV出力 */
  @Get('courses/:courseId/export')
  @Roles('instructor')
  async exportMembers(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<ExportResponse> {
    return this.usecase.exportCsv(courseId, user.userId);
  }
}
