import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { UserRepository } from './user.repository';
import { UserProfileRepository } from './user-profile.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type UserMeView =
  paths['/api/v1/users/me']['get']['responses']['200']['content']['application/json'];
type UserUpdateRequest =
  paths['/api/v1/users/me']['put']['requestBody']['content']['application/json'];
type SuccessResponse =
  paths['/api/v1/users/me']['put']['responses']['200']['content']['application/json'];
type PasswordChangeBody =
  paths['/api/v1/users/me/password']['put']['requestBody']['content']['application/json'];

/**
 * ユーザープロフィール UseCase
 *
 * API-001: プロフィール取得
 * API-002: プロフィール更新
 * API-003: パスワード変更
 */
@Injectable()
export class UserProfileUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly profileRepo: UserProfileRepository,
  ) {}

  /**
   * API-001: プロフィール取得
   * x-roles: all
   */
  async getMe(userId: string): Promise<UserMeView> {
    // TODO(TBD): Cursor実装
    // 1. User 取得
    // 2. UserProfile 結合（displayName, avatarFileObjectId, bio）
    // 3. OAuthIdentity 情報（必要に応じて）
    // 4. UserMeView として返却（globalRole 含む — Frontend のモード切替に使用）
    throw new Error('Not implemented');
  }

  /**
   * API-002: プロフィール更新
   * x-roles: all
   */
  async updateProfile(userId: string, body: UserUpdateRequest): Promise<SuccessResponse> {
    // TODO(TBD): Cursor実装
    // 1. User.name 更新（name が含まれる場合）
    // 2. UserProfile 更新（displayName, bio 等）
    throw new Error('Not implemented');
  }

  /**
   * API-003: パスワード変更
   * x-roles: all
   * ※ Keycloak連携の場合は Keycloak Admin API 経由の可能性あり。現時点ではDB直接更新でスタブ。
   */
  async changePassword(userId: string, body: PasswordChangeBody): Promise<SuccessResponse> {
    // TODO(TBD): Cursor実装
    // 1. PasswordCredential 取得
    // 2. 現在パスワード検証（bcrypt compare）
    // 3. 新パスワードハッシュ化 → 更新
    // 4. passwordUpdatedAt 更新
    throw new Error('Not implemented');
  }
}
