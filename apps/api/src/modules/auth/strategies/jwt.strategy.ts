import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

/**
 * Keycloak OIDC JWT 検証ストラテジー
 * Keycloak が発行した JWT を JWKS（公開鍵）で検証する
 *
 * 環境変数:
 * - OIDC_ISSUER_URL: Keycloak の Realm URL（例: http://localhost:8080/realms/adapt）
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const issuerUrl =
      process.env.OIDC_ISSUER_URL ?? 'http://localhost:8080/realms/adapt';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Keycloak の JWKS エンドポイントから公開鍵を動的に取得
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuerUrl}/protocol/openid-connect/certs`,
      }),
      // Keycloak が発行した JWT の issuer を検証
      issuer: issuerUrl,
      algorithms: ['RS256'],
    });
  }

  /**
   * JWT ペイロード検証
   * Keycloak の JWT ペイロードからユーザー情報を抽出する
   *
   * Keycloak JWT の主要フィールド:
   * - sub: Keycloak ユーザーID
   * - email: メールアドレス
   * - realm_access.roles: Realm ロール配列
   * - preferred_username: ユーザー名
   */
  async validate(payload: KeycloakJwtPayload): Promise<ValidatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing subject');
    }

    // Keycloak の realm_access.roles から GlobalRole に該当するロールを抽出
    const realmRoles = payload.realm_access?.roles ?? [];

    // GlobalRole に該当するもののみ抽出（schema.prisma の GlobalRole enum 準拠）
    const validGlobalRoles = [
      'guest',
      'learner',
      'instructor',
      'assistant',
      'operator',
      'root_operator',
    ];
    const globalRole =
      realmRoles.find((r) => validGlobalRoles.includes(r)) ?? 'guest';

    return {
      keycloakId: payload.sub,
      email: payload.email ?? null,
      name: payload.name ?? payload.preferred_username ?? null,
      globalRole,
      realmRoles,
    };
  }
}

/** Keycloak JWT ペイロードの型定義 */
export interface KeycloakJwtPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  azp?: string;
}

/** validate() が返す検証済みユーザー情報（request.user に格納される） */
export interface ValidatedUser {
  keycloakId: string;
  email: string | null;
  name: string | null;
  globalRole: string;
  realmRoles: string[];
}
