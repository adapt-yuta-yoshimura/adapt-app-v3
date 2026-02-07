import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UserRepository } from '../repositories/user.repository';
import { OAuthIdentityRepository } from '../repositories/oauth-identity.repository';
import { PasswordCredentialRepository } from '../repositories/password-credential.repository';
import { JwtTokenService } from './jwt.service';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findById: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let oauthIdentityRepository: {
    findByProviderAndProviderUserId: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateLastLogin: ReturnType<typeof vi.fn>;
  };
  let passwordCredentialRepository: {
    findByUserId: ReturnType<typeof vi.fn>;
    incrementFailedCount: ReturnType<typeof vi.fn>;
    resetFailedCount: ReturnType<typeof vi.fn>;
  };
  let jwtTokenService: {
    generateTokenPair: ReturnType<typeof vi.fn>;
    verifyToken: ReturnType<typeof vi.fn>;
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@adapt-co.io',
    name: 'テストユーザー',
    isActive: true,
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(() => {
    userRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    oauthIdentityRepository = {
      findByProviderAndProviderUserId: vi.fn(),
      create: vi.fn(),
      updateLastLogin: vi.fn(),
    };

    passwordCredentialRepository = {
      findByUserId: vi.fn(),
      incrementFailedCount: vi.fn(),
      resetFailedCount: vi.fn(),
    };

    jwtTokenService = {
      generateTokenPair: vi.fn(),
      verifyToken: vi.fn(),
    };

    service = new AuthService(
      userRepository as unknown as UserRepository,
      oauthIdentityRepository as unknown as OAuthIdentityRepository,
      passwordCredentialRepository as unknown as PasswordCredentialRepository,
      jwtTokenService as unknown as JwtTokenService,
    );
  });

  describe('login', () => {
    it('正常系: メールとパスワードでログインできる', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordCredentialRepository.findByUserId.mockResolvedValue({
        userId: 'user-1',
        passwordHash: 'hashed-password',
        isDisabled: false,
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtTokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await service.login('test@adapt-co.io', 'password123');

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.id).toBe('user-1');
      expect(passwordCredentialRepository.resetFailedCount).toHaveBeenCalledWith('user-1');
    });

    it('異常系: ユーザーが見つからない場合', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('unknown@test.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('異常系: アカウントが無効化されている場合', async () => {
      userRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.login('test@adapt-co.io', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('異常系: パスワード認証が無効化されている場合', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordCredentialRepository.findByUserId.mockResolvedValue({
        userId: 'user-1',
        passwordHash: 'hashed-password',
        isDisabled: true,
      });

      await expect(
        service.login('test@adapt-co.io', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('異常系: パスワードが不正な場合、失敗回数をインクリメントする', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordCredentialRepository.findByUserId.mockResolvedValue({
        userId: 'user-1',
        passwordHash: 'hashed-password',
        isDisabled: false,
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login('test@adapt-co.io', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(passwordCredentialRepository.incrementFailedCount).toHaveBeenCalledWith('user-1');
    });
  });

  describe('validateUser', () => {
    it('正常系: アクティブなユーザーを返す', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-1');

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@adapt-co.io',
        name: 'テストユーザー',
        isActive: true,
      });
    });

    it('異常系: ユーザーが見つからない場合はnullを返す', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent');

      expect(result).toBeNull();
    });

    it('異常系: 無効化されたユーザーはnullを返す', async () => {
      userRepository.findById.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await service.validateUser('user-1');

      expect(result).toBeNull();
    });
  });

  describe('refreshTokens', () => {
    it('正常系: 有効なリフレッシュトークンで新しいトークンを取得する', async () => {
      jwtTokenService.verifyToken.mockResolvedValue({
        sub: 'user-1',
        type: 'refresh',
      });
      userRepository.findById.mockResolvedValue(mockUser);
      jwtTokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.user.id).toBe('user-1');
    });

    it('異常系: 無効なリフレッシュトークンの場合', async () => {
      jwtTokenService.verifyToken.mockResolvedValue(null);

      await expect(
        service.refreshTokens('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('異常系: アクセストークンをリフレッシュに使った場合', async () => {
      jwtTokenService.verifyToken.mockResolvedValue({
        sub: 'user-1',
        type: 'access',
      });

      await expect(
        service.refreshTokens('access-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
