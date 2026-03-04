import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/jwt.types';
import type { RequestWithUser } from './auth.guard';

/**
 * 現在の認証ユーザーを取得するパラメータデコレータ
 *
 * AuthGuard が request.user に設定した AuthenticatedUser を取得する。
 *
 * 使用例:
 *   @Get()
 *   async getMe(@CurrentUser() user: AuthenticatedUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) {
      throw new Error('CurrentUser decorator requires AuthGuard');
    }
    return user;
  },
);
