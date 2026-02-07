import { describe, it, expect, beforeEach, vi } from 'vitest';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    repository = new UserRepository(prisma as unknown as PrismaService);
  });

  describe('findById', () => {
    it('ユーザーが見つかる場合にユーザーを返す', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@adapt-co.io',
        name: 'テストユーザー',
        isActive: true,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('ユーザーが見つからない場合にnullを返す', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('メールアドレスでユーザーを検索する', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@adapt-co.io',
        name: 'テストユーザー',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@adapt-co.io');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@adapt-co.io' },
      });
    });
  });

  describe('create', () => {
    it('ユーザーを作成して返す', async () => {
      const mockUser = {
        id: 'new-user',
        email: 'new@adapt-co.io',
        name: '新規ユーザー',
        isActive: true,
      };

      prisma.user.create.mockResolvedValue(mockUser);

      const result = await repository.create({
        email: 'new@adapt-co.io',
        name: '新規ユーザー',
      });

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@adapt-co.io',
          name: '新規ユーザー',
          isActive: true,
        },
      });
    });
  });

  describe('update', () => {
    it('ユーザー名を更新する', async () => {
      const mockUpdated = {
        id: 'user-1',
        email: 'test@adapt-co.io',
        name: '更新後の名前',
        isActive: true,
      };

      prisma.user.update.mockResolvedValue(mockUpdated);

      const result = await repository.update('user-1', { name: '更新後の名前' });

      expect(result).toEqual(mockUpdated);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: '更新後の名前' },
      });
    });
  });
});
