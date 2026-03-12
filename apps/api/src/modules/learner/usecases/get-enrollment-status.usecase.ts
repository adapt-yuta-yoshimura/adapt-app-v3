import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { LearnerEnrollmentRepository } from '../repositories/learner-enrollment.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type GetEnrollmentStatusResponse =
  paths['/api/v1/learner/enrollments/{enrollmentId}']['get']['responses']['200']['content']['application/json'];

/**
 * API-015: 決済/申込状況確認 UseCase
 *
 * x-roles: learner, instructor
 * x-policy: 閲覧のみ
 * ⚠ SoT差分: Response が GenericDetailView（additionalProperties: true）
 */
@Injectable()
export class GetEnrollmentStatusUseCase {
  constructor(
    private readonly learnerEnrollmentRepo: LearnerEnrollmentRepository,
  ) {}

  async execute(userId: string, enrollmentId: string): Promise<GetEnrollmentStatusResponse> {
    // TODO(TBD): Cursor実装
    // 1. enrollment 取得（learnerEnrollmentRepo.findById）
    // 2. 自分の enrollment か確認 → 404（他人の enrollment / 不存在）
    // 3. Order / Payment 情報の結合（決済状況）
    //    - learnerEnrollmentRepo.findByIdWithPayment
    // 4. GenericDetailView を返却
    throw new Error('Not implemented');
  }
}
