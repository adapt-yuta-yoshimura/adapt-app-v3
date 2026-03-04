import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { UserLookupService } from '../user-lookup.service';

describe('UserLookupService', () => {
  let service: UserLookupService;
  let mockPrisma: {
    oAuthIdentity: { findFirst: ReturnType<typeof vi.fn> };
    user: { findFirst: ReturnType<typeof vi.fn> };
  };

  const mockUser = {
    id: 'user-1',
    email: 'op@example.com',
    name: 'Operator',
    globalRole: 'operator',
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockIdentity = {
    id: 'identity-1',
    userId: 'user-1',
    provider: 'keycloak',
    providerUserId: 'keycloak-sub-123',
    email: 'op@example.com',
    lastLoginAt: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      oAuthIdentity: { findFirst: vi.fn() },
      user: { findFirst: vi.fn() },
    };
    service = new UserLookupService(mockPrisma as unknown as PrismaService);
  });

  it('should resolve user from JWT sub via OAuthIdentity', async () => {
    mockPrisma.oAuthIdentity.findFirst.mockResolvedValue(mockIdentity);
    mockPrisma.user.findFirst.mockResolvedValue(mockUser);

    const result = await service.findUserByOAuthSub('keycloak-sub-123');

    expect(result).toEqual(mockUser);
    expect(mockPrisma.oAuthIdentity.findFirst).toHaveBeenCalledWith({
      where: { provider: 'keycloak', providerUserId: 'keycloak-sub-123' },
    });
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-1', deletedAt: null, isActive: true },
    });
  });

  it('should return null when OAuthIdentity not found', async () => {
    mockPrisma.oAuthIdentity.findFirst.mockResolvedValue(null);

    const result = await service.findUserByOAuthSub('unknown-sub');

    expect(result).toBeNull();
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('should return null when User not found', async () => {
    mockPrisma.oAuthIdentity.findFirst.mockResolvedValue(mockIdentity);
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const result = await service.findUserByOAuthSub('keycloak-sub-123');

    expect(result).toBeNull();
  });

  it('should return null when user is inactive', async () => {
    mockPrisma.oAuthIdentity.findFirst.mockResolvedValue(mockIdentity);
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const result = await service.findUserByOAuthSub('keycloak-sub-123');

    expect(result).toBeNull();
  });
});
