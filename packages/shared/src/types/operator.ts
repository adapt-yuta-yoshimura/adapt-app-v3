/**
 * 運営スタッフ Admin View 型定義
 * @see openapi_admin.yaml - components.schemas.OperatorAdminView
 * 運営スタッフは PlatformMembership テーブルではなく User.globalRole で管理
 */

import type { GlobalRole } from '../enums/global-role.enum';

/**
 * 運営スタッフ一覧用 View（API-ADMIN-15）
 * OpenAPI: OperatorAdminView
 * User テーブルから globalRole が operator/root_operator のレコードを取得
 */
export interface OperatorAdminView {
  id: string;
  email: string | null;
  name: string | null;
  globalRole: Extract<GlobalRole, GlobalRole.OPERATOR | GlobalRole.ROOT_OPERATOR>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
