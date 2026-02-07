import { Injectable, Logger } from '@nestjs/common';

/**
 * JWT ユーティリティサービス
 *
 * Keycloak 移行後は JWT の発行は行わない。
 * JWT の検証は Passport + jwks-rsa が担当する。
 * このサービスは将来的な拡張用（トークンのブラックリスト管理等）として残す。
 */
@Injectable()
export class JwtTokenService {
  private readonly logger = new Logger(JwtTokenService.name);

  /**
   * 将来用: Refresh token のブラックリスト管理
   * Keycloak が refresh token を管理するため、基本的には不要
   */
  async revokeToken(tokenId: string): Promise<void> {
    this.logger.log(`Token revocation requested: ${tokenId}`);
    // TODO: Redis ベースのブラックリスト管理（必要に応じて）
  }
}

/**
 * JWT ペイロード型（後方互換用）
 * 新しいコードでは ValidatedUser（jwt.strategy.ts）を使用すること
 */
export interface JwtPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/** トークンペア型（後方互換用） */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
