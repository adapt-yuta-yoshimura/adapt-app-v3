import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { UserRepository } from '../repositories/user.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type GetProfileResponse =
  paths['/api/v1/users/me']['get']['responses']['200']['content']['application/json'];

/**
 * API-001: プロフィール取得 UseCase
 *
 * GET /api/v1/users/me
 * x-roles: all
 * x-policy: '-'
 */
@Injectable()
export class GetProfileUseCase {
  constructor(
    private readonly userRepo: UserRepository,
  ) {}

  async execute(userId: string): Promise<GetProfileResponse> {
    // TODO(TBD): Cursor実装
    // - userRepo.findById(userId)
    // - 404: 存在しない（通常は発生しない = JWT から取得した userId）
    // - UserMeView への変換
    throw new Error('Not implemented');
  }
}
