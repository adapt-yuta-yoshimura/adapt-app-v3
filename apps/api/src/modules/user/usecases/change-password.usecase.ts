import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { PasswordCredentialRepository } from '../repositories/password-credential.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type ChangePasswordRequest =
  paths['/api/v1/users/me/password']['put']['requestBody']['content']['application/json'];
type ChangePasswordResponse =
  paths['/api/v1/users/me/password']['put']['responses']['200']['content']['application/json'];

/**
 * API-003: パスワード変更 UseCase
 *
 * PUT /api/v1/users/me/password
 * x-roles: all
 * x-policy: '-'
 *
 * SoT差分: Request が GenericWriteRequest（additionalProperties: true）。
 * パスワード変更の具体フィールド（currentPassword, newPassword 等）は未定義。
 * Keycloak 統合方針（OIDC リダイレクト型）に依存するため、仮実装で対応。
 */
@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly passwordCredentialRepo: PasswordCredentialRepository,
  ) {}

  async execute(userId: string, data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    // TODO(TBD): Cursor実装
    // ⚠ 本番は Keycloak 経由。仮実装は PasswordCredential 直接更新。
    //
    // 仮実装:
    // 1. PasswordCredential を userId で取得
    // 2. 現在のパスワード検証（data.currentPassword — フィールド名 TBD）
    // 3. 新パスワードハッシュ化 + 更新
    // 4. SuccessResponse { success: true } を返却
    //
    // 本番（Keycloak 統合後）:
    // - Keycloak Admin API PUT /admin/realms/{realm}/users/{id} を呼び出し
    // - or Keycloak Account API を使用
    throw new Error('Not implemented');
  }
}
