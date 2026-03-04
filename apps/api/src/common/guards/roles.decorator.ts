import { SetMetadata } from '@nestjs/common';
import type { GlobalRole } from '../auth/jwt.types';

/**
 * ロール指定デコレータ
 *
 * OpenAPI x-roles に基づき、エンドポイントに必要なロールを指定する。
 * RolesGuard と組み合わせて使用。
 *
 * 使用例:
 *   @Roles('operator', 'root_operator')  // operator以上
 *   @Roles('root_operator')               // root_operator のみ
 *
 * SoT準拠: GlobalRole は guest, learner, instructor, operator, root_operator
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: GlobalRole[]) => SetMetadata(ROLES_KEY, roles);
