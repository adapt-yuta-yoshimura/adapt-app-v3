import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AuditEventType, GlobalRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { AdminUserUseCase } from '../admin-user.usecase';
import { UserRepository } from '../../repositories/user.repository';
import { OAuthIdentityRepository } from '../../repositories/oauth-identity.repository';
import { AuditEventRepository } from '../../../audit/repositories/audit-event.repository';

const mockUser: User = {
  id: 'user-1',
  email: 'u1@example.com',
  name: 'User One',
  globalRole: 'learner',
  isActive: true,
  deletedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('AdminUserUseCase', () => {
  let useCase: AdminUserUseCase;
  let userRepo: { findMany: ReturnType<typeof vi.fn>; findById: ReturnType<typeof vi.fn>; findByEmail: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; softDelete: ReturnType<typeof vi.fn> };
  let oauthRepo: { findLastLoginAtByUserIds: ReturnType<typeof vi.fn> };
  let auditRepo: { create: ReturnType<typeof vi.fn> };

  const actorUserId = 'actor-1';
  const actorGlobalRole = GlobalRole.operator;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepo = {
      findMany: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    oauthRepo = { findLastLoginAtByUserIds: vi.fn() };
    auditRepo = { create: vi.fn().mockResolvedValue(undefined) };
    useCase = new AdminUserUseCase(
      userRepo as unknown as UserRepository,
      oauthRepo as unknown as OAuthIdentityRepository,
      auditRepo as unknown as AuditEventRepository,
    );
  });

  describe('listUsers', () => {
    it('正常系: 一覧と meta を返す', async () => {
      userRepo.findMany.mockResolvedValue({ users: [mockUser], totalCount: 1 });
      oauthRepo.findLastLoginAtByUserIds.mockResolvedValue({ 'user-1': new Date('2025-01-10') });

      const result = await useCase.listUsers(actorUserId, { page: 1, perPage: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].user.id).toBe('user-1');
      expect(result.items[0].status).toBe('active');
      expect(result.items[0].lastLoginAt).toBe('2025-01-10T00:00:00.000Z');
      expect(result.meta).toEqual({ totalCount: 1, page: 1, perPage: 20, totalPages: 1 });
      expect(userRepo.findMany).toHaveBeenCalledWith({ page: 1, perPage: 20 });
      expect(oauthRepo.findLastLoginAtByUserIds).toHaveBeenCalledWith(['user-1']);
    });

    it('正常系: 空一覧のとき items が空', async () => {
      userRepo.findMany.mockResolvedValue({ users: [], totalCount: 0 });
      oauthRepo.findLastLoginAtByUserIds.mockResolvedValue({});

      const result = await useCase.listUsers(actorUserId, { globalRole: 'learner' });

      expect(result.items).toEqual([]);
      expect(result.meta.totalCount).toBe(0);
      expect(oauthRepo.findLastLoginAtByUserIds).toHaveBeenCalledWith([]);
    });
  });

  describe('inviteUser', () => {
    it('正常系: ユーザー作成と監査ログを記録して UserAdminView を返す', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue(mockUser);

      const result = await useCase.inviteUser(actorUserId, actorGlobalRole, {
        email: 'new@example.com',
        name: 'New User',
        globalRole: 'learner',
      });

      expect(result.user.id).toBe('user-1');
      expect(result.status).toBe('active');
      expect(result.lastLoginAt).toBeNull();
      expect(userRepo.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(userRepo.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        name: 'New User',
        globalRole: 'learner',
      });
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId,
          eventType: AuditEventType.user_created,
          actorGlobalRole: GlobalRole.operator,
          reason: 'User invited via admin',
          metaJson: { targetUserId: 'user-1' },
        })
      );
    });

    it('異常系: メール重複で 409 ConflictException', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        useCase.inviteUser(actorUserId, actorGlobalRole, {
          email: 'u1@example.com',
          name: 'Duplicate',
          globalRole: 'instructor',
        })
      ).rejects.toThrow(ConflictException);
      await expect(
        useCase.inviteUser(actorUserId, actorGlobalRole, {
          email: 'u1@example.com',
          name: 'Duplicate',
          globalRole: 'instructor',
        })
      ).rejects.toThrow('User with this email already exists');

      expect(userRepo.create).not.toHaveBeenCalled();
      expect(auditRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('正常系: 更新して UserResponse を返す', async () => {
      const updated = { ...mockUser, name: 'Updated Name' };
      userRepo.findById.mockResolvedValue(mockUser);
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.update.mockResolvedValue(updated);

      const result = await useCase.updateUser(actorUserId, actorGlobalRole, 'user-1', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
      expect(userRepo.update).toHaveBeenCalledWith('user-1', { name: 'Updated Name' });
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEventType.user_updated,
          metaJson: { targetUserId: 'user-1' },
        })
      );
    });

    it('異常系: ユーザーが存在しないとき 404 NotFoundException', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.updateUser(actorUserId, actorGlobalRole, 'unknown', { name: 'X' })
      ).rejects.toThrow(NotFoundException);
      await expect(
        useCase.updateUser(actorUserId, actorGlobalRole, 'unknown', { name: 'X' })
      ).rejects.toThrow('User not found');

      expect(userRepo.update).not.toHaveBeenCalled();
      expect(auditRepo.create).not.toHaveBeenCalled();
    });

    it('異常系: 変更先メールが他ユーザーと重複で 409 ConflictException', async () => {
      const otherUser = { ...mockUser, id: 'user-2', email: 'other@example.com' };
      userRepo.findById.mockResolvedValue(mockUser);
      userRepo.findByEmail.mockResolvedValue(otherUser);

      await expect(
        useCase.updateUser(actorUserId, actorGlobalRole, 'user-1', { email: 'other@example.com' })
      ).rejects.toThrow(ConflictException);
      await expect(
        useCase.updateUser(actorUserId, actorGlobalRole, 'user-1', { email: 'other@example.com' })
      ).rejects.toThrow('User with this email already exists');

      expect(userRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('正常系: 論理削除と監査ログを記録して SuccessResponse を返す', async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      userRepo.softDelete.mockResolvedValue({ ...mockUser, deletedAt: new Date(), isActive: false });

      const result = await useCase.deleteUser(actorUserId, actorGlobalRole, 'user-1');

      expect(result).toEqual({ success: true });
      expect(userRepo.softDelete).toHaveBeenCalledWith('user-1');
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEventType.user_deleted,
          metaJson: { targetUserId: 'user-1' },
        })
      );
    });

    it('異常系: ユーザーが存在しないとき 404 NotFoundException', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.deleteUser(actorUserId, actorGlobalRole, 'unknown')
      ).rejects.toThrow(NotFoundException);
      await expect(
        useCase.deleteUser(actorUserId, actorGlobalRole, 'unknown')
      ).rejects.toThrow('User not found');

      expect(userRepo.softDelete).not.toHaveBeenCalled();
      expect(auditRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('freezeUser', () => {
    it('正常系: isActive=false に更新し監査ログを記録する', async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      userRepo.update.mockResolvedValue({ ...mockUser, isActive: false });

      const result = await useCase.freezeUser(actorUserId, actorGlobalRole, 'user-1');

      expect(result).toEqual({ success: true });
      expect(userRepo.update).toHaveBeenCalledWith('user-1', { isActive: false });
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEventType.user_frozen,
          metaJson: { targetUserId: 'user-1' },
        })
      );
    });

    it('異常系: ユーザーが存在しないとき 404 NotFoundException', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.freezeUser(actorUserId, actorGlobalRole, 'unknown')
      ).rejects.toThrow(NotFoundException);
      await expect(
        useCase.freezeUser(actorUserId, actorGlobalRole, 'unknown')
      ).rejects.toThrow('User not found');

      expect(userRepo.update).not.toHaveBeenCalled();
      expect(auditRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('unfreezeUser', () => {
    it('正常系: isActive=true に更新し監査ログを記録する', async () => {
      const frozenUser = { ...mockUser, isActive: false };
      userRepo.findById.mockResolvedValue(frozenUser);
      userRepo.update.mockResolvedValue({ ...mockUser, isActive: true });

      const result = await useCase.unfreezeUser(actorUserId, actorGlobalRole, 'user-1');

      expect(result).toEqual({ success: true });
      expect(userRepo.update).toHaveBeenCalledWith('user-1', { isActive: true });
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEventType.user_unfrozen,
          metaJson: { targetUserId: 'user-1' },
        })
      );
    });

    it('異常系: ユーザーが存在しないとき 404 NotFoundException', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.unfreezeUser(actorUserId, actorGlobalRole, 'unknown')
      ).rejects.toThrow(NotFoundException);
      await expect(
        useCase.unfreezeUser(actorUserId, actorGlobalRole, 'unknown')
      ).rejects.toThrow('User not found');

      expect(userRepo.update).not.toHaveBeenCalled();
      expect(auditRepo.create).not.toHaveBeenCalled();
    });
  });
});
