import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserRepository } from '../repositories/user.repository';
import { OAuthIdentityRepository } from '../repositories/oauth-identity.repository';
import { PasswordCredentialRepository } from '../repositories/password-credential.repository';
import { JwtTokenService, TokenPair } from './jwt.service';

/** Google OAuthプロファイル */
export interface GoogleProfile {
  id: string;
  email: string;
  displayName?: string;
}

/** ログインレスポンス */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
}

/** bcrypt のラウンド数 */
const BCRYPT_ROUNDS = 10;

/**
 * 認証サービス
 * ログイン・ログアウト・トークンリフレッシュ・OAuthコールバックのビジネスロジックを担当
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly oauthIdentityRepository: OAuthIdentityRepository,
    private readonly passwordCredentialRepository: PasswordCredentialRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  /**
   * メールアドレスとパスワードでログインする
   * @param email メールアドレス
   * @param password パスワード
   * @returns 認証レスポンス（トークン + ユーザー情報）
   * @throws {UnauthorizedException} 認証失敗時
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // 1. ユーザー検索
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. アカウント有効性チェック
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // 3. パスワード認証情報取得
    const credential = await this.passwordCredentialRepository.findByUserId(user.id);
    if (!credential) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. パスワード無効化チェック
    if (credential.isDisabled) {
      throw new UnauthorizedException('Password authentication is disabled');
    }

    // 5. パスワード検証
    const isPasswordValid = await bcrypt.compare(password, credential.passwordHash);
    if (!isPasswordValid) {
      await this.passwordCredentialRepository.incrementFailedCount(user.id);
      throw new UnauthorizedException('Invalid email or password');
    }

    // 6. 失敗回数リセット
    await this.passwordCredentialRepository.resetFailedCount(user.id);

    // 7. トークン生成
    const tokens = await this.jwtTokenService.generateTokenPair(
      user.id,
      user.email ?? '',
    );

    this.logger.log(`User logged in: ${user.id}`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * ログアウト処理
   * 現在はステートレスJWTのため、クライアント側でトークンを破棄する
   * 将来的にはRefresh tokenのブラックリスト管理を追加予定
   *
   * @param userId ユーザーID
   */
  async logout(userId: string): Promise<void> {
    // TODO(ADAPT-AUTH): Refresh tokenのブラックリスト管理（Redis）
    this.logger.log(`User logged out: ${userId}`);
  }

  /**
   * Refresh token を使ってトークンペアを再発行する
   * @param refreshToken リフレッシュトークン
   * @returns 新しい認証レスポンス
   * @throws {UnauthorizedException} トークンが無効な場合
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    // 1. Refresh token 検証
    const payload = await this.jwtTokenService.verifyToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 2. トークン種別チェック
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // 3. ユーザー存在チェック
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 4. アカウント有効性チェック
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // 5. 新しいトークンペア生成
    const tokens = await this.jwtTokenService.generateTokenPair(
      user.id,
      user.email ?? '',
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Google OAuth認証コールバック処理
   * ユーザーが存在しない場合は新規作成し、OAuthIdentityを紐付ける
   *
   * @param profile Googleプロファイル情報
   * @returns 認証レスポンス
   */
  async handleGoogleCallback(profile: GoogleProfile): Promise<AuthResponse> {
    // 1. 既存のOAuthIdentityを検索
    const existingIdentity =
      await this.oauthIdentityRepository.findByProviderAndProviderUserId(
        'google',
        profile.id,
      );

    if (existingIdentity) {
      // 既存ユーザー：最終ログイン更新
      await this.oauthIdentityRepository.updateLastLogin(existingIdentity.id);

      const user = await this.userRepository.findById(existingIdentity.userId);
      if (!user) {
        throw new NotFoundException('User not found for OAuth identity');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      const tokens = await this.jwtTokenService.generateTokenPair(
        user.id,
        user.email ?? '',
      );

      this.logger.log(`Google OAuth login: ${user.id}`);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }

    // 2. 新規ユーザー作成
    // メールアドレスで既存ユーザーを検索（メール統合）
    let user = await this.userRepository.findByEmail(profile.email);

    if (!user) {
      user = await this.userRepository.create({
        email: profile.email,
        name: profile.displayName,
      });
      this.logger.log(`New user created via Google OAuth: ${user.id}`);
    }

    // 3. OAuthIdentity作成
    await this.oauthIdentityRepository.create({
      userId: user.id,
      provider: 'google',
      providerUserId: profile.id,
      email: profile.email,
    });

    // 4. トークン生成
    const tokens = await this.jwtTokenService.generateTokenPair(
      user.id,
      user.email ?? '',
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * パスワードをハッシュ化する
   * @param password 平文パスワード
   * @returns ハッシュ化されたパスワード
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * ユーザーIDからユーザー情報を取得する（トークン検証後のユーザー取得用）
   * @param userId ユーザーID
   * @returns ユーザー情報、見つからない場合はnull
   */
  async validateUser(userId: string): Promise<{ id: string; email: string | null; name: string | null; isActive: boolean } | null> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
    };
  }
}
