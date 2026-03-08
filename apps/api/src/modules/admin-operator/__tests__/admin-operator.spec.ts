import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { AuditEventType, GlobalRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { AdminOperatorUseCase } from '../usecases/admin-operator.usecase';
import { OperatorRepository } from '../repositories/operator.repository';
import { AuditEventRepository } from '../../audit/repositories/audit-event.repository';

const mockOperator: User = {
  id: 'op-1',
  email: 'op1@example.com',
  name: 'Operator One',
  globalRole: 'operator',
  isActive: true,
  deletedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockRootOperator: User = {
  id: 'rop-1',
  email: 'rop1@example.com',
  name: 'Root Operator',
  globalRole: 'root_operator',
  isActive: true,
  deletedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('AdminOperatorUseCase', () => {
  let useCase: AdminOperatorUseCase;
  let operatorRepo: {
    findOperators: ReturnType<typeof vi.fn>;
    findOperatorById: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateRole: ReturnType<typeof vi.fn>;
    softDelete: ReturnType<typeof vi.fn>;
  };
  let auditRepo: { create: ReturnType<typeof vi.fn> };

  const actorUserId = 'actor-root-1';
  const actorGlobalRole = GlobalRole.root_operator;

  beforeEach(() => {
    vi.clearAllMocks();
    operatorRepo = {
      findOperators: vi.fn(),
      findOperatorById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      updateRole: vi.fn(),
      softDelete: vi.fn(),
    };
    auditRepo = { create: vi.fn().mockResolvedValue(undefined) };
    useCase = new AdminOperatorUseCase(
      operatorRepo as unknown as OperatorRepository,
      auditRepo as unknown as AuditEventRepository,
    );
  });

  // =========================================================================
  // [API-ADMIN-15] GET /api/v1/admin/operators
  // =========================================================================
  describe('listOperators', () => {
    it('root_operator → 200: OperatorListResponse を返す', async () => {
      operatorRepo.findOperators.mockResolvedValue({
        operators: [mockOperator, mockRootOperator],
        totalCount: 2,
      });

      const result = await useCase.listOperators(actorUserId, {
        page: 1,
        perPage: 20,
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe('op-1');
      expect(result.items[0].globalRole).toBe('operator');
      expect(result.items[1].globalRole).toBe('root_operator');
      expect(result.meta).toEqual({
        totalCount: 2,
        page: 1,
        perPage: 20,
        totalPages: 1,
      });
      expect(operatorRepo.findOperators).toHaveBeenCalledWith({
        page: 1,
        perPage: 20,
      });
    });

    it('空一覧のとき items が空', async () => {
      operatorRepo.findOperators.mockResolvedValue({
        operators: [],
        totalCount: 0,
      });

      const result = await useCase.listOperators(actorUserId);

      expect(result.items).toEqual([]);
      expect(result.meta.totalCount).toBe(0);
    });
  });

  // =========================================================================
  // [API-ADMIN-16] POST /api/v1/admin/operators
  // =========================================================================
  describe('inviteOperator', () => {
    it('root_operator + 正常 → 201: OperatorAdminView を返す', async () => {
      operatorRepo.findByEmail.mockResolvedValue(null);
      operatorRepo.create.mockResolvedValue(mockOperator);

      const result = await useCase.inviteOperator(
        actorUserId,
        actorGlobalRole,
        { email: 'new-op@example.com', name: 'New Op', globalRole: 'operator' },
      );

      expect(result.id).toBe('op-1');
      expect(result.globalRole).toBe('operator');
      expect(operatorRepo.findByEmail).toHaveBeenCalledWith(
        'new-op@example.com',
      );
      expect(operatorRepo.create).toHaveBeenCalledWith({
        email: 'new-op@example.com',
        name: 'New Op',
        globalRole: 'operator',
      });
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId,
          eventType: AuditEventType.user_created,
          actorGlobalRole: GlobalRole.root_operator,
          reason: '運営スタッフ招待',
          metaJson: expect.objectContaining({
            targetUserId: 'op-1',
            targetEmail: mockOperator.email,
            targetName: mockOperator.name,
            targetGlobalRole: mockOperator.globalRole,
          }),
        }),
      );
    });

    it('root_operator + email重複 → 409 ConflictException', async () => {
      operatorRepo.findByEmail.mockResolvedValue(mockOperator);

      await expect(
        useCase.inviteOperator(actorUserId, actorGlobalRole, {
          email: 'op1@example.com',
          name: 'Dup',
          globalRole: 'operator',
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        useCase.inviteOperator(actorUserId, actorGlobalRole, {
          email: 'op1@example.com',
          name: 'Dup',
          globalRole: 'operator',
        }),
      ).rejects.toThrow('User with this email already exists');

      expect(operatorRepo.create).not.toHaveBeenCalled();
      expect(auditRepo.create).not.toHaveBeenCalled();
    });

    it('root_operator + 不正なglobalRole(learner) → 400 BadRequestException', async () => {
      await expect(
        useCase.inviteOperator(actorUserId, actorGlobalRole, {
          email: 'a@example.com',
          name: 'Test',
          globalRole: 'learner' as 'operator' | 'root_operator',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(operatorRepo.findByEmail).not.toHaveBeenCalled();
      expect(operatorRepo.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // [API-ADMIN-17] PATCH /api/v1/admin/operators/:userId
  // =========================================================================
  describe('updateOperator', () => {
    it('root_operator + operator→root_operator → 200: OperatorAdminView を返す', async () => {
      const updated = { ...mockOperator, globalRole: 'root_operator' as const };
      operatorRepo.findOperatorById.mockResolvedValue(mockOperator);
      operatorRepo.updateRole.mockResolvedValue(updated);

      const result = await useCase.updateOperator(
        actorUserId,
        actorGlobalRole,
        'op-1',
        { globalRole: 'root_operator' },
      );

      expect(result.globalRole).toBe('root_operator');
      expect(operatorRepo.updateRole).toHaveBeenCalledWith(
        'op-1',
        'root_operator',
      );
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEventType.operator_role_changed,
          metaJson: expect.objectContaining({
            targetUserId: 'op-1',
            targetEmail: mockOperator.email,
            targetName: mockOperator.name,
            targetGlobalRole: mockOperator.globalRole,
            previousRole: 'operator',
            newRole: 'root_operator',
          }),
        }),
      );
    });

    it('root_operator + root_operator→operator → 200: OperatorAdminView を返す', async () => {
      const updated = {
        ...mockRootOperator,
        globalRole: 'operator' as const,
      };
      operatorRepo.findOperatorById.mockResolvedValue(mockRootOperator);
      operatorRepo.updateRole.mockResolvedValue(updated);

      const result = await useCase.updateOperator(
        actorUserId,
        actorGlobalRole,
        'rop-1',
        { globalRole: 'operator' },
      );

      expect(result.globalRole).toBe('operator');
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metaJson: expect.objectContaining({
            targetUserId: 'rop-1',
            targetEmail: mockRootOperator.email,
            targetName: mockRootOperator.name,
            targetGlobalRole: mockRootOperator.globalRole,
            previousRole: 'root_operator',
            newRole: 'operator',
          }),
        }),
      );
    });

    it('root_operator + 存在しないuserId → 404 NotFoundException', async () => {
      operatorRepo.findOperatorById.mockResolvedValue(null);

      await expect(
        useCase.updateOperator(actorUserId, actorGlobalRole, 'unknown', {
          globalRole: 'operator',
        }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        useCase.updateOperator(actorUserId, actorGlobalRole, 'unknown', {
          globalRole: 'operator',
        }),
      ).rejects.toThrow('Operator not found');

      expect(operatorRepo.updateRole).not.toHaveBeenCalled();
      expect(auditRepo.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // [API-ADMIN-18] DELETE /api/v1/admin/operators/:userId
  // =========================================================================
  describe('deleteOperator', () => {
    it('root_operator → 200: SuccessResponse を返す', async () => {
      operatorRepo.findOperatorById.mockResolvedValue(mockOperator);
      operatorRepo.softDelete.mockResolvedValue({
        ...mockOperator,
        deletedAt: new Date(),
        isActive: false,
      });

      const result = await useCase.deleteOperator(
        actorUserId,
        actorGlobalRole,
        'op-1',
      );

      expect(result).toEqual({ success: true, message: '運営スタッフを削除しました' });
      expect(operatorRepo.softDelete).toHaveBeenCalledWith('op-1');
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEventType.user_deleted,
          metaJson: expect.objectContaining({
            targetUserId: 'op-1',
            targetEmail: mockOperator.email,
            targetName: mockOperator.name,
            targetGlobalRole: mockOperator.globalRole,
          }),
        }),
      );
    });

    it('削除後: globalRole は保持される（softDelete は globalRole を変更しない）', async () => {
      const softDeleted = {
        ...mockOperator,
        deletedAt: new Date(),
        isActive: false,
        globalRole: 'operator' as const, // globalRole 保持
      };
      operatorRepo.findOperatorById.mockResolvedValue(mockOperator);
      operatorRepo.softDelete.mockResolvedValue(softDeleted);

      await useCase.deleteOperator(actorUserId, actorGlobalRole, 'op-1');

      // softDelete の呼び出し引数に globalRole 変更が含まれないことを確認
      expect(operatorRepo.softDelete).toHaveBeenCalledWith('op-1');
    });

    it('root_operator + 存在しないuserId → 404 NotFoundException', async () => {
      operatorRepo.findOperatorById.mockResolvedValue(null);

      await expect(
        useCase.deleteOperator(actorUserId, actorGlobalRole, 'unknown'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        useCase.deleteOperator(actorUserId, actorGlobalRole, 'unknown'),
      ).rejects.toThrow('Operator not found');

      expect(operatorRepo.softDelete).not.toHaveBeenCalled();
      expect(auditRepo.create).not.toHaveBeenCalled();
    });
  });
});
