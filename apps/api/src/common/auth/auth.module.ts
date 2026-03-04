import { Global, Module } from '@nestjs/common';
import { JwtTokenService } from './jwt-token.service';
import { UserLookupService } from './user-lookup.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

/**
 * 認証基盤モジュール（ADMIN-00）
 *
 * JWT検証・User解決・Guard を提供する。
 * 全Admin APIで AuthGuard / RolesGuard を使用するため Global で登録する。
 */
@Global()
@Module({
  providers: [JwtTokenService, UserLookupService, AuthGuard, RolesGuard],
  exports: [JwtTokenService, UserLookupService, AuthGuard, RolesGuard],
})
export class AuthModule {}
