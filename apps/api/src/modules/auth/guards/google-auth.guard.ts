import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Google OAuth 認証ガード
 * Google OAuth フローのエンドポイントで使用する
 *
 * @example
 * ```typescript
 * @UseGuards(GoogleAuthGuard)
 * @Get('google')
 * async googleAuth(): Promise<void> { ... }
 * ```
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
