/**
 * JWT関連の型定義
 *
 * OIDC（auth.adapt-co.io / Keycloak）から取得するJWTペイロードの型。
 * GlobalRole は SoT（schema.prisma）の定義に準拠。
 */

/** SoT準拠: GlobalRole（schema.prisma enum GlobalRole） */
export type GlobalRole = 'guest' | 'learner' | 'instructor' | 'operator' | 'root_operator';

/** JWTペイロード（Keycloak OIDC トークンからデコードされる情報） */
export interface JwtPayload {
  /** Keycloak subject（ユーザー識別子） */
  sub: string;
  /** メールアドレス */
  email?: string;
  /** 表示名 */
  name?: string;
  /** トークン発行時刻（Unix timestamp） */
  iat?: number;
  /** トークン有効期限（Unix timestamp） */
  exp?: number;
  // TODO(TBD): Cursor実装 - Keycloak固有のクレーム（realm_access等）を追加
}

/** AuthGuard で Request に付与されるユーザー情報 */
export interface AuthenticatedUser {
  /** User.id（DBのcuid） */
  userId: string;
  /** メールアドレス */
  email: string | null;
  /** 表示名 */
  name: string | null;
  /** グローバルロール */
  globalRole: GlobalRole;
}
