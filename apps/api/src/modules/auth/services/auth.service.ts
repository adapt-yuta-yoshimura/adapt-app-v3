import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';

import { UserRepository } from '../repositories/user.repository';
import { ValidatedUser } from '../strategies/jwt.strategy';

/**
 * 認証サービス（OIDC 対応版）
 *
 * 認証は Keycloak が担当するため、このサービスの役割は:
 * - Keycloak ユーザーと DB ユーザーの同期（プロビジョニング）
 * - ユーザー情報の取得
 *
 * 自前の JWT 発行、パスワード検証、Google OAuth 処理は Keycloak に移譲。
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Keycloak ユーザーと DB ユーザーを同期する
   * JWT 検証後に呼び出し、DB にユーザーが存在しない場合は作成する
   *
   * @param validatedUser Keycloak JWT から取得したユーザー情報
   * @returns DB 上のユーザー、未プロビジョニングの場合は null
   */
  async syncUser(validatedUser: ValidatedUser): Promise<User | null> {
    // Keycloak ID で DB ユーザーを検索
    // TODO: User モデルに keycloakId カラムが追加されたら findByKeycloakId に変更
    let user = await this.userRepository.findByEmail(validatedUser.email ?? '');

    if (!user && validatedUser.email) {
      // 初回ログイン時: DB にユーザーを作成
      user = await this.userRepository.create({
        email: validatedUser.email,
        name: validatedUser.name ?? undefined,
      });
      this.logger.log(`New user synced from Keycloak: ${user.id} (${validatedUser.email})`);
    }

    return user;
  }

  /**
   * ユーザーの有効性を確認する
   * @param userId DB ユーザーID
   * @returns ユーザー情報、無効な場合は null
   */
  async validateUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }
}
