import { Injectable, Logger } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

/** JWTペイロード型 */
export interface JwtPayload {
  /** ユーザーID（subject） */
  sub: string;
  /** メールアドレス */
  email: string;
  /** トークン種別 */
  type: 'access' | 'refresh';
  /** 発行日時（秒） */
  iat?: number;
  /** 有効期限（秒） */
  exp?: number;
}

/** トークンペア */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * JWT トークン管理サービス
 * Access token / Refresh token の生成・検証を担当
 */
@Injectable()
export class JwtTokenService {
  private readonly logger = new Logger(JwtTokenService.name);

  constructor(private readonly jwtService: NestJwtService) {}

  /**
   * Access token と Refresh token のペアを生成する
   * @param userId ユーザーID
   * @param email メールアドレス
   * @returns トークンペア
   */
  async generateTokenPair(userId: string, email: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email),
      this.generateRefreshToken(userId, email),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Access token を生成する（有効期限: 15分）
   * @param userId ユーザーID
   * @param email メールアドレス
   * @returns Access token
   */
  async generateAccessToken(userId: string, email: string): Promise<string> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: userId,
      email,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    });
  }

  /**
   * Refresh token を生成する（有効期限: 7日）
   * @param userId ユーザーID
   * @param email メールアドレス
   * @returns Refresh token
   */
  async generateRefreshToken(userId: string, email: string): Promise<string> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: userId,
      email,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
    });
  }

  /**
   * トークンを検証してペイロードを返す
   * @param token JWT トークン
   * @returns 検証済みペイロード、無効な場合はnull
   */
  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch (error) {
      this.logger.warn(`Token verification failed: ${(error as Error).message}`);
      return null;
    }
  }
}
