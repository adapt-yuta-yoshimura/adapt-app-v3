import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * リクエストから認証済みユーザー情報を取得するパラメータデコレータ
 *
 * @example
 * ```typescript
 * @Get('me')
 * async getMe(@CurrentUser() user: ValidatedUser): Promise<UserDto> {
 *   return this.userService.findById(user.keycloakId);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (data) {
      return (user as Record<string, unknown>)?.[data];
    }

    return user;
  },
);
