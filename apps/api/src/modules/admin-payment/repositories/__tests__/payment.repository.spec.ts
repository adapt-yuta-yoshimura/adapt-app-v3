import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentRepository } from '../payment.repository';
import { PrismaService } from '../../../../common/prisma/prisma.service';

const mockPayment = {
  id: 'pay-1',
  providerRef: 'ref-1',
  userId: 'user-1',
  courseId: 'course-1',
  amount: 10000,
  currency: 'jpy',
  paidAt: new Date('2025-02-01'),
  createdAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-01-15'),
  provider: 'stripe',
  status: 'succeeded',
};

describe('PaymentRepository', () => {
  let repo: PaymentRepository;
  let mockPrisma: {
    payment: { findMany: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
    user: { findMany: ReturnType<typeof vi.fn> };
    course: { findMany: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      payment: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      user: { findMany: vi.fn() },
      course: { findMany: vi.fn() },
    };
    repo = new PaymentRepository(mockPrisma as unknown as PrismaService);
  });

  describe('findManyWithRelations', () => {
    it('正常系: 一覧と userMap / courseMap を返す', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([mockPayment]);
      mockPrisma.payment.count.mockResolvedValue(1);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'user-1', name: 'User One' },
      ]);
      mockPrisma.course.findMany.mockResolvedValue([
        { id: 'course-1', title: 'Course Alpha' },
      ]);

      const result = await repo.findManyWithRelations({ page: 1, perPage: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('pay-1');
      expect(result.totalCount).toBe(1);
      expect(result.userMap['user-1']).toBe('User One');
      expect(result.courseMap['course-1']).toBe('Course Alpha');
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 20,
        }),
      );
      expect(mockPrisma.payment.count).toHaveBeenCalledWith({ where: {} });
    });

    it('status フィルターを where に渡す', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.course.findMany.mockResolvedValue([]);

      await repo.findManyWithRelations({ status: 'succeeded' });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'succeeded' },
        }),
      );
    });

    it('courseId が null の場合は course を問い合わせない', async () => {
      const paymentNoCourse = { ...mockPayment, courseId: null };
      mockPrisma.payment.findMany.mockResolvedValue([paymentNoCourse]);
      mockPrisma.payment.count.mockResolvedValue(1);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'user-1', name: 'User One' },
      ]);

      const result = await repo.findManyWithRelations({ page: 1, perPage: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.courseMap).toEqual({});
      expect(mockPrisma.course.findMany).not.toHaveBeenCalled();
    });

    it('空一覧のとき user/course を問い合わせない', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);

      const result = await repo.findManyWithRelations({ page: 1, perPage: 20 });

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
      expect(result.userMap).toEqual({});
      expect(result.courseMap).toEqual({});
      expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.course.findMany).not.toHaveBeenCalled();
    });
  });
});
