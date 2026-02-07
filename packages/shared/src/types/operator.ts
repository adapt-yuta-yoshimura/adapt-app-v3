/**
 * 運営スタッフ Admin View 型定義
 * @see openapi_admin.yaml - components.schemas.OperatorAdminView, PlatformMembership
 * API-076 運営スタッフ一覧の items 要素
 */

import type { PlatformRole } from '../enums/platform-role.enum';
import type { User } from './user';

/**
 * 運営スタッフ一覧用 View（API-076）
 * OpenAPI: OperatorAdminView（additionalProperties: true のため、
 * 実装では PlatformMembership 相当 + 表示用 user を含む想定）
 */
export interface OperatorAdminView {
  id: string;
  userId: string;
  role: PlatformRole;
  createdAt: string;
  updatedAt: string;
  /** 一覧表示用（API が含める場合） */
  user?: User;
}
