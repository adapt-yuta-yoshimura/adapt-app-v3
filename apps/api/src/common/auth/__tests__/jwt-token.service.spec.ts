import { Test } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtTokenService } from '../jwt-token.service';
import type { JwtPayload } from '../jwt.types';

const mockJwtVerify = vi.fn();
const mockCreateRemoteJWKSet = vi.fn();

vi.mock('jose', () => ({
  createRemoteJWKSet: (...args: Parameters<typeof import('jose').createRemoteJWKSet>) => mockCreateRemoteJWKSet(...args),
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
  decodeJwt: vi.fn((token: string) => {
    if (!token || token.trim() === '') throw new Error('invalid');
    return { sub: 'sub-1', email: 'a@b.co', name: 'Test', iat: 1, exp: 9999999999 };
  }),
}));

describe('JwtTokenService', () => {
  let service: JwtTokenService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [JwtTokenService],
    }).compile();

    service = module.get(JwtTokenService);
  });

  it('should verify a valid JWT and return payload', async () => {
    const payload: JwtPayload = {
      sub: 'keycloak-sub-123',
      email: 'op@example.com',
      name: 'Operator',
      iat: Math.floor(Date.now() / 1000) - 60,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    mockJwtVerify.mockResolvedValue({ payload: { ...payload } });

    const result = await service.verifyToken('valid-jwt-token');

    expect(result).toEqual(payload);
    expect(mockJwtVerify).toHaveBeenCalledWith('valid-jwt-token', expect.anything());
  });

  it('should throw UnauthorizedException for expired JWT', async () => {
    mockJwtVerify.mockRejectedValue(new Error('JWT expired'));

    await expect(service.verifyToken('expired-token')).rejects.toThrow(UnauthorizedException);
    await expect(service.verifyToken('expired-token')).rejects.toThrow('Invalid or expired token');
  });

  it('should throw UnauthorizedException for invalid signature', async () => {
    mockJwtVerify.mockRejectedValue(new Error('signature verification failed'));

    await expect(service.verifyToken('tampered-token')).rejects.toThrow(UnauthorizedException);
    await expect(service.verifyToken('tampered-token')).rejects.toThrow('Invalid or expired token');
  });

  it('should throw UnauthorizedException for empty token', async () => {
    await expect(service.verifyToken('')).rejects.toThrow(UnauthorizedException);
    await expect(service.verifyToken('')).rejects.toThrow('Missing or invalid token');
    expect(mockJwtVerify).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException for whitespace-only token', async () => {
    await expect(service.verifyToken('   ')).rejects.toThrow(UnauthorizedException);
    await expect(service.verifyToken('   ')).rejects.toThrow('Missing or invalid token');
    expect(mockJwtVerify).not.toHaveBeenCalled();
  });
});
