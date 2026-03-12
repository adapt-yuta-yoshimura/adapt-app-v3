import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthGuard } from '../auth.guard';
import type { RequestWithUser } from '../auth.guard';
import { JwtTokenService } from '../../auth/jwt-token.service';
import { UserLookupService } from '../../auth/user-lookup.service';

function createMockExecutionContext(overrides: {
  authorization?: string;
  user?: RequestWithUser['user'];
}): ExecutionContext {
  const request = {
    headers: { authorization: overrides.authorization },
    user: overrides.user,
  } as RequestWithUser;

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: vi.fn(),
    getClass: vi.fn(),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockReflector: { getAllAndOverride: ReturnType<typeof vi.fn> };
  let mockJwtTokenService: { verifyToken: ReturnType<typeof vi.fn> };
  let mockUserLookupService: { findUserByOAuthSub: ReturnType<typeof vi.fn> };

  const validPayload = {
    sub: 'keycloak-sub-123',
    email: 'op@example.com',
    name: 'Operator',
    iat: 1,
    exp: 9999999999,
  };

  const operatorUser = {
    id: 'user-1',
    email: 'op@example.com',
    name: 'Operator',
    globalRole: 'operator',
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const rootOperatorUser = {
    ...operatorUser,
    id: 'user-root',
    globalRole: 'root_operator',
  };

  beforeEach(() => {
    mockReflector = { getAllAndOverride: vi.fn().mockReturnValue(false) };
    mockJwtTokenService = { verifyToken: vi.fn() };
    mockUserLookupService = { findUserByOAuthSub: vi.fn() };
    guard = new AuthGuard(
      mockReflector as unknown as Reflector,
      mockJwtTokenService as unknown as JwtTokenService,
      mockUserLookupService as unknown as UserLookupService,
    );
  });

  it('should authenticate with valid Bearer token and set request.user', async () => {
    mockJwtTokenService.verifyToken.mockResolvedValue(validPayload);
    mockUserLookupService.findUserByOAuthSub.mockResolvedValue(operatorUser);

    const context = createMockExecutionContext({
      authorization: 'Bearer valid-token',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    expect(request.user).toEqual({
      userId: 'user-1',
      email: 'op@example.com',
      name: 'Operator',
      globalRole: 'operator',
    });
  });

  it('should authenticate operator user', async () => {
    mockJwtTokenService.verifyToken.mockResolvedValue(validPayload);
    mockUserLookupService.findUserByOAuthSub.mockResolvedValue(operatorUser);

    const context = createMockExecutionContext({
      authorization: 'Bearer token',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    expect(request.user?.globalRole).toBe('operator');
  });

  it('should authenticate root_operator user', async () => {
    mockJwtTokenService.verifyToken.mockResolvedValue({ ...validPayload, sub: 'root-sub' });
    mockUserLookupService.findUserByOAuthSub.mockResolvedValue(rootOperatorUser);

    const context = createMockExecutionContext({
      authorization: 'Bearer token',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    expect(request.user?.globalRole).toBe('root_operator');
  });

  it('should return 401 when no Authorization header', async () => {
    const context = createMockExecutionContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(context)).rejects.toThrow('Missing or invalid Authorization header');
    expect(mockJwtTokenService.verifyToken).not.toHaveBeenCalled();
  });

  it('should return 401 for non-Bearer scheme', async () => {
    const context = createMockExecutionContext({
      authorization: 'Basic dXNlcjpwYXNz',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(context)).rejects.toThrow('Missing or invalid Authorization header');
    expect(mockJwtTokenService.verifyToken).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token', async () => {
    mockJwtTokenService.verifyToken.mockRejectedValue(new UnauthorizedException('Invalid or expired token'));

    const context = createMockExecutionContext({
      authorization: 'Bearer invalid-token',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should return 401 when user not found for token subject', async () => {
    mockJwtTokenService.verifyToken.mockResolvedValue(validPayload);
    mockUserLookupService.findUserByOAuthSub.mockResolvedValue(null);

    const context = createMockExecutionContext({
      authorization: 'Bearer valid-token',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(context)).rejects.toThrow('User not found for token subject');
  });
});
