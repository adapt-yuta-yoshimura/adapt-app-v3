import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '../user.repository';
import { PrismaService } from '../../../../common/prisma/prisma.service';

const mockUser = {
  id: 'user-1',
  email: 'u1@example.com',
  name: 'User One',
  globalRole: 'learner',
  isActive: true,
  deletedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('UserRepository', () => {
  let repo: UserRepository;
  let mockPrisma: {
    user: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };
    repo = new UserRepository(mockPrisma as unknown as PrismaService);
  });

  describe('findMany', () => {
    it('正常系: ユーザー一覧と totalCount を返す', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await repo.findMany({ page: 1, perPage: 20 });

      expect(result.users).toEqual([mockUser]);
      expect(result.totalCount).toBe(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.user.count).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });

    it('正常系: globalRole でフィルタする', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await repo.findMany({ globalRole: 'instructor', page: 1, perPage: 10 });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { globalRole: 'instructor', deletedAt: null },
          skip: 0,
          take: 10,
        })
      );
    });

    it('正常系: isActive でフィルタする', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await repo.findMany({ isActive: true, page: 1, perPage: 20 });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true, deletedAt: null },
        })
      );
    });

    it('正常系: includeDeleted で削除済みを含める', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await repo.findMany({ includeDeleted: true, page: 1, perPage: 20 });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });

    it('正常系: ページネーションの skip/take が正しい', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(100);

      await repo.findMany({ page: 3, perPage: 10 });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 })
      );
    });
  });

  describe('findById', () => {
    it('正常系: ユーザーを返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repo.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('異常系: 存在しない id で null を返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repo.findById('unknown');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('正常系: メールでユーザーを返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repo.findByEmail('u1@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'u1@example.com' },
      });
    });

    it('異常系: 存在しないメールで null を返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repo.findByEmail('none@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('正常系: ユーザーを作成して返す', async () => {
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await repo.create({
        email: 'u1@example.com',
        name: 'User One',
        globalRole: 'learner',
      });

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'u1@example.com',
          name: 'User One',
          globalRole: 'learner',
        },
      });
    });
  });

  describe('update', () => {
    it('正常系: 指定フィールドのみ更新する', async () => {
      const updated = { ...mockUser, name: 'Updated Name' };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await repo.update('user-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'Updated Name' },
      });
    });

    it('正常系: isActive を更新する', async () => {
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, isActive: false });

      await repo.update('user-1', { isActive: false });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { isActive: false },
      });
    });
  });

  describe('softDelete', () => {
    it('正常系: deletedAt と isActive=false を設定する', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date(), isActive: false };
      mockPrisma.user.update.mockResolvedValue(deletedUser);

      const result = await repo.softDelete('user-1');

      expect(result.isActive).toBe(false);
      expect(result.deletedAt).toBeDefined();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          isActive: false,
          deletedAt: expect.any(Date),
        }),
      });
    });
  });
});
