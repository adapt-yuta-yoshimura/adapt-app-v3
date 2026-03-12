import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { UserRepository } from '../repositories/user.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type UpdateProfileRequest =
  paths['/api/v1/users/me']['put']['requestBody']['content']['application/json'];
type UpdateProfileResponse =
  paths['/api/v1/users/me']['put']['responses']['200']['content']['application/json'];

/**
 * API-002: プロフィール更新 UseCase
 *
 * PUT /api/v1/users/me
 * x-roles: all
 * x-policy: '-'
 */
@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly userRepo: UserRepository,
  ) {}

  async execute(userId: string, data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    // TODO(TBD): Cursor実装
    // - userRepo.update(userId, data)
    // - email 更新時: unique 制約チェック → 409 Conflict
    // - SuccessResponse { success: true } を返却
    throw new Error('Not implemented');
  }
}
