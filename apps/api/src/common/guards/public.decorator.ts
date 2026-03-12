import { SetMetadata } from '@nestjs/common';

/**
 * 公開エンドポイントデコレータ
 *
 * AuthGuard をスキップし、未認証（guest）アクセスを許可する。
 * API-009, API-010 等の x-roles: guest を含むエンドポイントに使用。
 *
 * 使用例:
 *   @Public()
 *   @Get('courses')
 *   async listPublicCourses() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
