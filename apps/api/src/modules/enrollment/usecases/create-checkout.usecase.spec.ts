import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCheckoutUseCase } from './create-checkout.usecase';
import { StoreCourseRepository } from '../../store/repositories/store-course.repository';
import { OrderRepository } from '../repositories/order.repository';
import { PaymentRepository } from '../repositories/payment.repository';

/**
 * STU-01: CreateCheckout UseCase テスト（API-012）
 * 正常系（スタブ）+ 凍結423 + 404 + クーポン検証をカバー
 */
describe('CreateCheckoutUseCase', () => {
  let useCase: CreateCheckoutUseCase;
  let storeCourseRepo: {
    findActivePublic: ReturnType<typeof vi.fn>;
    findPublicById: ReturnType<typeof vi.fn>;
  };
  let orderRepo: {
    create: ReturnType<typeof vi.fn>;
  };
  let paymentRepo: {
    create: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-learner-1';
  const courseId = 'course-1';

  beforeEach(() => {
    vi.clearAllMocks();
    storeCourseRepo = {
      findActivePublic: vi.fn(),
      findPublicById: vi.fn(),
    };
    orderRepo = {
      create: vi.fn(),
    };
    paymentRepo = {
      create: vi.fn(),
    };

    useCase = new CreateCheckoutUseCase(
      storeCourseRepo as unknown as StoreCourseRepository,
      orderRepo as unknown as OrderRepository,
      paymentRepo as unknown as PaymentRepository,
    );
  });

  describe('execute (API-012)', () => {
    it('正常系: CheckoutResponse が返却される（201）', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // Stripe SDK はスタブ → { sessionId, url } を返却
      await expect(
        useCase.execute(userId, courseId),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 423 - 講座が凍結中', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // storeCourseRepo.findPublicById → { isFrozen: true }
      // HttpException(423) を期待
      await expect(
        useCase.execute(userId, courseId),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 403 - learner 以外のロール', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // RolesGuard で担保されるが、UseCase 単体テストとしてもカバー
      await expect(
        useCase.execute(userId, courseId),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 404 - 存在しない講座', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // storeCourseRepo.findPublicById → null
      // NotFoundException を期待
      await expect(
        useCase.execute(userId, courseId),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: クーポンコード検証（有効 / 無効 / 期限切れ）', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // 有効: 割引適用
      // 無効: BadRequestException
      // 期限切れ: BadRequestException
      await expect(
        useCase.execute(userId, courseId, 'INVALID_COUPON'),
      ).rejects.toThrow('Not implemented');
    });
  });
});
