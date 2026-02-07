import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../services/jwt.service';
import { AuthService } from '../services/auth.service';

/**
 * JWT認証ストラテジー
 * Authorization: Bearer <token> ヘッダーからJWTを抽出・検証する
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'default-secret-change-me',
      algorithms: ['HS256'],
    });
  }

  /**
   * JWTペイロード検証
   * トークンのシグネチャ検証後に呼ばれる
   *
   * @param payload JWTペイロード
   * @returns 検証済みユーザー情報（request.userに格納される）
   * @throws {UnauthorizedException} ユーザーが見つからないか無効な場合
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Access tokenであることを確認
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // ユーザーの存在と有効性を確認
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    return payload;
  }
}
