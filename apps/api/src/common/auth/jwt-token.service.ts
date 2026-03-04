import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as jose from 'jose';
import type { JwtPayload } from './jwt.types';

/**
 * JWT署名・検証サービス
 *
 * OIDC（auth.adapt-co.io / Keycloak）から発行されたJWTトークンの
 * 検証・デコードを担当する技術サービス。
 *
 * 環境変数:
 * - AUTH_JWKS_URI: JWKS エンドポイント URL（例: https://auth.adapt-co.io/realms/adapt/protocol/openid-connect/certs）
 */
@Injectable()
export class JwtTokenService {
  private readonly logger = new Logger(JwtTokenService.name);

  /**
   * JWTトークンを検証し、ペイロードを返す
   *
   * @param token - Bearer トークン文字列（Bearer プレフィックスなし）
   * @returns デコードされたJWTペイロード
   * @throws UnauthorizedException 検証失敗時
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const jwksUri = process.env.AUTH_JWKS_URI;
    if (!jwksUri) {
      this.logger.warn('AUTH_JWKS_URI is not set; JWT verification may fail');
    }

    try {
      const JWKS = jose.createRemoteJWKSet(
        new URL(jwksUri ?? 'https://auth.adapt-co.io/realms/adapt/protocol/openid-connect/certs'),
      );
      const { payload } = await jose.jwtVerify(token, JWKS);
      return this.toJwtPayload(payload);
    } catch (err) {
      this.logger.debug(`JWT verification failed: ${err instanceof Error ? err.message : String(err)}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * JWTトークンからペイロードをデコード（検証なし・デバッグ用）
   *
   * @param token - Bearer トークン文字列
   * @returns デコードされたJWTペイロード
   */
  decodeToken(token: string): JwtPayload {
    const decoded = jose.decodeJwt(token);
    return this.toJwtPayload(decoded);
  }

  private toJwtPayload(payload: jose.JWTPayload): JwtPayload {
    const sub = payload.sub;
    if (typeof sub !== 'string') {
      throw new Error('JWT payload missing sub');
    }
    return {
      sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      name: typeof payload.name === 'string' ? payload.name : undefined,
      iat: typeof payload.iat === 'number' ? payload.iat : undefined,
      exp: typeof payload.exp === 'number' ? payload.exp : undefined,
    };
  }
}
