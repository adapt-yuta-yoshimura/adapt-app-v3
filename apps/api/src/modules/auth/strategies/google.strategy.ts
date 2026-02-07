import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

import { GoogleProfile } from '../services/auth.service';

/**
 * Google OAuth 2.0 認証ストラテジー
 * Google OIDCフローを処理する
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://auth.localhost.adapt:3002/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  /**
   * Google認証成功後のコールバック
   * GoogleプロファイルからアプリケーションのGoogleProfile型に変換する
   *
   * @param _accessToken Google Access Token（未使用）
   * @param _refreshToken Google Refresh Token（未使用）
   * @param profile Googleプロファイル
   * @param done PassportコールバックVerifyCallback
   */
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const googleProfile: GoogleProfile = {
      id: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      displayName: profile.displayName,
    };

    done(null, googleProfile);
  }
}
