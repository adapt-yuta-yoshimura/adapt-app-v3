import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Payment } from '@prisma/client';
import { AdminPaymentUseCase } from '../usecases/admin-payment.usecase';
import { PaymentRepository } from '../repositories/payment.repository';

/**
 * ADMIN-05: 決済管理 UseCase テスト
 *
 * SoT: openapi_admin.yaml - API-ADMIN-19
 * SoT: schema.prisma - Payment, PaymentStatus, PaymentProvider
 */

const mockPaymentWithCourse: Payment = {
  id: 'pay-1',
  providerRef: 'ref-1',
  userId: 'user-1',
  courseId: 'course-1',
  amount: 10000,
  currency: 'jpy',
  paidAt: new Date('2025-02-01T12:00:00Z'),
  createdAt: new Date('2025-01-15T10:00:00Z'),
  updatedAt: new Date('2025-01-15T10:00:00Z'),
  provider: 'stripe',
  status: 'succeeded',
};

const mockPaymentWithoutCourse: Payment = {
  id: 'pay-2',
  providerRef: null,
  userId: 'user-2',
  courseId: null,
  amount: 5000,
  currency: 'jpy',
  paidAt: null,
  createdAt: new Date('2025-01-10T08:00:00Z'),
  updatedAt: new Date('2025-01-10T08:00:00Z'),
  provider: 'manual',
  status: 'pending',
};

describe('AdminPaymentUseCase', () => {
  let useCase: AdminPaymentUseCase;
  let paymentRepo: {
    findManyWithRelations: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    paymentRepo = {
      findManyWithRelations: vi.fn(),
    };
    useCase = new AdminPaymentUseCase(
      paymentRepo as unknown as PaymentRepository,
    );
  });

  describe('listPayments', () => {
    it('operator → 200: PaymentListResponse を返す', async () => {
      paymentRepo.findManyWithRelations.mockResolvedValue({
        items: [mockPaymentWithCourse],
        totalCount: 1,
        userMap: { 'user-1': 'User One' },
        courseMap: { 'course-1': 'Course Alpha' },
      });

      const result = await useCase.listPayments('operator-user-id', {
        page: 1,
        perPage: 20,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('pay-1');
      expect(result.items[0].userId).toBe('user-1');
      expect(result.items[0].userName).toBe('User One');
      expect(result.items[0].courseId).toBe('course-1');
      expect(result.items[0].courseTitle).toBe('Course Alpha');
      expect(result.items[0].amount).toBe(10000);
      expect(result.items[0].currency).toBe('jpy');
      expect(result.items[0].status).toBe('succeeded');
      expect(result.items[0].provider).toBe('stripe');
      expect(result.meta).toEqual({
        totalCount: 1,
        page: 1,
        perPage: 20,
        totalPages: 1,
      });
      expect(paymentRepo.findManyWithRelations).toHaveBeenCalledWith({
        page: 1,
        perPage: 20,
      });
    });

    it('root_operator → 200: PaymentListResponse を返す', async () => {
      paymentRepo.findManyWithRelations.mockResolvedValue({
        items: [mockPaymentWithCourse],
        totalCount: 1,
        userMap: { 'user-1': 'User One' },
        courseMap: { 'course-1': 'Course Alpha' },
      });

      const result = await useCase.listPayments('root-operator-user-id');

      expect(result.items).toHaveLength(1);
      expect(result.meta.totalCount).toBe(1);
    });

    it('items に userName（required）が含まれること', async () => {
      paymentRepo.findManyWithRelations.mockResolvedValue({
        items: [mockPaymentWithCourse],
        totalCount: 1,
        userMap: { 'user-1': 'User One' },
        courseMap: { 'course-1': 'Course Alpha' },
      });

      const result = await useCase.listPayments('actor-id');

      expect(result.items[0].userName).toBe('User One');
    });

    it('items に courseTitle（nullable）が含まれること', async () => {
      paymentRepo.findManyWithRelations.mockResolvedValue({
        items: [mockPaymentWithCourse],
        totalCount: 1,
        userMap: { 'user-1': 'User One' },
        courseMap: { 'course-1': 'Course Alpha' },
      });

      const result = await useCase.listPayments('actor-id');

      expect(result.items[0].courseTitle).toBe('Course Alpha');
    });

    it('courseId が null の場合 courseTitle も null', async () => {
      paymentRepo.findManyWithRelations.mockResolvedValue({
        items: [mockPaymentWithoutCourse],
        totalCount: 1,
        userMap: { 'user-2': 'User Two' },
        courseMap: {},
      });

      const result = await useCase.listPayments('actor-id');

      expect(result.items[0].courseId).toBeNull();
      expect(result.items[0].courseTitle).toBeNull();
    });

    it('ページネーション: meta に totalCount, page, perPage, totalPages が含まれる', async () => {
      paymentRepo.findManyWithRelations.mockResolvedValue({
        items: [],
        totalCount: 50,
        userMap: {},
        courseMap: {},
      });

      const result = await useCase.listPayments('actor-id', {
        page: 2,
        perPage: 10,
      });

      expect(result.meta).toEqual({
        totalCount: 50,
        page: 2,
        perPage: 10,
        totalPages: 5,
      });
    });

    it('status フィルター: succeeded を渡すと repo に渡される', async () => {
      paymentRepo.findManyWithRelations.mockResolvedValue({
        items: [mockPaymentWithCourse],
        totalCount: 1,
        userMap: { 'user-1': 'User One' },
        courseMap: { 'course-1': 'Course Alpha' },
      });

      await useCase.listPayments('actor-id', { status: 'succeeded' });

      expect(paymentRepo.findManyWithRelations).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'succeeded' }),
      );
    });

    it('ソート: sortBy / sortOrder を repo に渡す', async () => {
      paymentRepo.findManyWithRelations.mockResolvedValue({
        items: [],
        totalCount: 0,
        userMap: {},
        courseMap: {},
      });

      await useCase.listPayments('actor-id', {
        sortBy: 'amount',
        sortOrder: 'desc',
      });

      expect(paymentRepo.findManyWithRelations).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'amount',
          sortOrder: 'desc',
        }),
      );
    });

    it('空一覧のとき items が空配列', async () => {
      paymentRepo.findManyWithRelations.mockResolvedValue({
        items: [],
        totalCount: 0,
        userMap: {},
        courseMap: {},
      });

      const result = await useCase.listPayments('actor-id');

      expect(result.items).toEqual([]);
      expect(result.meta.totalCount).toBe(0);
      expect(result.meta.totalPages).toBe(1);
    });
  });
});
