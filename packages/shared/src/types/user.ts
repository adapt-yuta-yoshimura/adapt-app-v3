/**
 * ユーザー・Admin View 型定義
 * @see openapi_admin.yaml - components.schemas.User, UserAdminView, UserMeView
 * @see openapi_app.yaml - components.schemas.User（同一形状）
 */

import type { GlobalRole } from '../enums';

/**
 * ユーザー（基本情報）
 * OpenAPI: User
 */
export interface User {
  id: string;
  email: string | null;
  name: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  globalRole: GlobalRole;
}

/**
 * 管理画面：ユーザー一覧用 View（API-073 等）
 * OpenAPI: UserAdminView
 */
export interface UserAdminView {
  user: User;
  status: string;
  lastLoginAt: string | null;
}

/**
 * 自分自身のユーザー情報（App 認証後等）
 * OpenAPI: UserMeView（allOf User）
 */
export type UserMeView = User;
