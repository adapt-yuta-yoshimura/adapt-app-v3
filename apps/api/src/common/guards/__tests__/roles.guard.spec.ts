import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RolesGuard } from '../roles.guard';
import type { RequestWithUser } from '../auth.guard';

function createMockExecutionContext(user: RequestWithUser['user']): ExecutionContext {
  const request = { user } as RequestWithUser;
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: vi.fn(),
    getClass: vi.fn(),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: { getAllAndOverride: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockReflector = { getAllAndOverride: vi.fn() };
    guard = new RolesGuard(mockReflector as unknown as Reflector);
  });

  it('should allow operator when roles include operator', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['operator', 'root_operator']);
    const context = createMockExecutionContext({
      userId: 'u1',
      email: null,
      name: null,
      globalRole: 'operator',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow root_operator when roles include operator', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['operator', 'root_operator']);
    const context = createMockExecutionContext({
      userId: 'u1',
      email: null,
      name: null,
      globalRole: 'root_operator',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow root_operator when roles require root_operator only', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['root_operator']);
    const context = createMockExecutionContext({
      userId: 'u1',
      email: null,
      name: null,
      globalRole: 'root_operator',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny operator when roles require root_operator only', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['root_operator']);
    const context = createMockExecutionContext({
      userId: 'u1',
      email: null,
      name: null,
      globalRole: 'operator',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Insufficient role');
  });

  it('should deny learner for admin endpoints', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['operator', 'root_operator']);
    const context = createMockExecutionContext({
      userId: 'u1',
      email: null,
      name: null,
      globalRole: 'learner',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Insufficient role');
  });

  it('should deny instructor for admin endpoints', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['operator', 'root_operator']);
    const context = createMockExecutionContext({
      userId: 'u1',
      email: null,
      name: null,
      globalRole: 'instructor',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Insufficient role');
  });

  it('should deny guest for admin endpoints', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['operator', 'root_operator']);
    const context = createMockExecutionContext({
      userId: 'u1',
      email: null,
      name: null,
      globalRole: 'guest',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Insufficient role');
  });

  it('should allow all when no @Roles decorator is set', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const contextOperator = createMockExecutionContext({
      userId: 'u1',
      email: null,
      name: null,
      globalRole: 'operator',
    });
    expect(guard.canActivate(contextOperator)).toBe(true);

    const contextLearner = createMockExecutionContext({
      userId: 'u2',
      email: null,
      name: null,
      globalRole: 'learner',
    });
    expect(guard.canActivate(contextLearner)).toBe(true);
  });

  it('should throw ForbiddenException when user is missing', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['operator', 'root_operator']);
    const context = createMockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Authentication required');
  });
});
