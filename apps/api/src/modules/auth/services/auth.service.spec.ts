import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AuthService } from './auth.service';
import { UserRepository } from '../repositories/user.repository';
import type { ValidatedUser } from '../strategies/jwt.strategy';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findById: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@adapt-co.io',
    name: 'テストユーザー',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    service = new AuthService(
      userRepository as unknown as UserRepository,
    );
  });

  describe('syncUser', () => {
    it('正常系: 既存ユーザーをメールで検索して返す', async () => {
      const validatedUser: ValidatedUser = {
        keycloakId: 'kc-1',
        email: 'test@adapt-co.io',
        name: 'テストユーザー',
        globalRole: 'learner',
        realmRoles: ['learner'],
      };
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.syncUser(validatedUser);

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@adapt-co.io');
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('正常系: メールが無い場合は既存検索のみで null になり得る', async () => {
      const validatedUser: ValidatedUser = {
        keycloakId: 'kc-1',
        email: null,
        name: null,
        globalRole: 'guest',
        realmRoles: [],
      };
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.syncUser(validatedUser);

      expect(result).toBeNull();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('正常系: 初回ログイン時はユーザーを新規作成する', async () => {
      const validatedUser: ValidatedUser = {
        keycloakId: 'kc-new',
        email: 'new@adapt-co.io',
        name: '新規ユーザー',
        globalRole: 'learner',
        realmRoles: ['learner'],
      };
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        ...mockUser,
        id: 'user-new',
        email: 'new@adapt-co.io',
        name: '新規ユーザー',
      });

      const result = await service.syncUser(validatedUser);

      expect(result).not.toBeNull();
      expect(result?.email).toBe('new@adapt-co.io');
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'new@adapt-co.io',
        name: '新規ユーザー',
      });
    });
  });

  describe('validateUser', () => {
    it('正常系: アクティブなユーザーを返す', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-1');

      expect(result).toEqual(mockUser);
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
});
