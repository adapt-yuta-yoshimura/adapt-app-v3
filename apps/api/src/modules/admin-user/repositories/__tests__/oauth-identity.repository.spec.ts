import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OAuthIdentityRepository } from '../oauth-identity.repository';
import { PrismaService } from '../../../../common/prisma/prisma.service';

describe('OAuthIdentityRepository', () => {
  let repo: OAuthIdentityRepository;
  let mockPrisma: {
    oAuthIdentity: { groupBy: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      oAuthIdentity: { groupBy: vi.fn() },
    };
    repo = new OAuthIdentityRepository(mockPrisma as unknown as PrismaService);
  });

  describe('findLastLoginAtByUserIds', () => {
    it('正常系: 複数ユーザーの lastLoginAt を返す', async () => {
      const d1 = new Date('2025-01-10T12:00:00Z');
      const d2 = new Date('2025-01-15T12:00:00Z');
      mockPrisma.oAuthIdentity.groupBy.mockResolvedValue([
        { userId: 'user-1', _max: { lastLoginAt: d1 } },
        { userId: 'user-2', _max: { lastLoginAt: d2 } },
      ]);

      const result = await repo.findLastLoginAtByUserIds(['user-1', 'user-2']);

      expect(result).toEqual({ 'user-1': d1, 'user-2': d2 });
      expect(mockPrisma.oAuthIdentity.groupBy).toHaveBeenCalledWith({
        by: ['userId'],
        where: { userId: { in: ['user-1', 'user-2'] } },
        _max: { lastLoginAt: true },
      });
    });

    it('正常系: lastLoginAt が null の行はマップに含めない', async () => {
      const d1 = new Date('2025-01-10T12:00:00Z');
      mockPrisma.oAuthIdentity.groupBy.mockResolvedValue([
        { userId: 'user-1', _max: { lastLoginAt: d1 } },
        { userId: 'user-2', _max: { lastLoginAt: null } },
      ]);

      const result = await repo.findLastLoginAtByUserIds(['user-1', 'user-2']);

      expect(result).toEqual({ 'user-1': d1 });
    });

    it('正常系: userIds が空のとき空オブジェクトを返し groupBy を呼ばない', async () => {
      const result = await repo.findLastLoginAtByUserIds([]);

      expect(result).toEqual({});
      expect(mockPrisma.oAuthIdentity.groupBy).not.toHaveBeenCalled();
    });

    it('異常系: 該当なしのとき空オブジェクトを返す', async () => {
      mockPrisma.oAuthIdentity.groupBy.mockResolvedValue([]);

      const result = await repo.findLastLoginAtByUserIds(['unknown']);

      expect(result).toEqual({});
    });
  });
});
