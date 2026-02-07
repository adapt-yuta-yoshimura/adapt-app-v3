import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT認証ガード
 * すべての認証が必要なエンドポイントで使用する
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('me')
 * async getMe(@CurrentUser() user: ValidatedUser): Promise<UserDto> { ... }
 * ```
 */
@Injectable()
export class JwtAuthGuard extends PassportAuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  /**
   * 認証失敗時のエラーハンドリング
   * Passportの認証結果を受け取り、適切なエラーをスローする
   */
  handleRequest<TUser>(err: Error | null, user: TUser | false): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
