import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentUseCase } from './payment.usecase';
import { PaymentRepository } from './payment.repository';

/**
 * STU: Payment UseCase テスト（API-012）
 * 正常系（スタブ）+ 凍結423をカバー
 */
describe('PaymentUseCase', () => {
  let useCase: PaymentUseCase;
  let paymentRepo: {
    createOrder: ReturnType<typeof vi.fn>;
    createPayment: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-learner-1';

  beforeEach(() => {
    vi.clearAllMocks();
    paymentRepo = {
      createOrder: vi.fn(),
      createPayment: vi.fn(),
    };

    useCase = new PaymentUseCase(
      paymentRepo as unknown as PaymentRepository,
    );
  });

  describe('createCheckoutSession (API-012)', () => {
    it('正常系: Stripe セッション生成（スタブ）', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // Stripe SDK はスタブ → sessionUrl を返却
      await expect(
        useCase.createCheckoutSession(userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 凍結講座で 423', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // Course.isFrozen=true → HttpException(423)
      await expect(
        useCase.createCheckoutSession(userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });
  });
});
