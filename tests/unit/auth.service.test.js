import { jest } from '@jest/globals';

const mockFindUserByEmail = jest.fn();
const mockFindUserById = jest.fn();
const mockCreateUser = jest.fn();
const mockCreateRefreshToken = jest.fn();
const mockFindRefreshTokensByUserId = jest.fn();
const mockDeleteRefreshToken = jest.fn();

await jest.unstable_mockModule('../../src/repositories/user.repository.js', () => ({
  createUser: mockCreateUser,
  findUserByEmail: mockFindUserByEmail,
  findUserById: mockFindUserById,
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

await jest.unstable_mockModule('../../src/repositories/refreshToken.repository.js', () => ({
  createRefreshToken: mockCreateRefreshToken,
  findRefreshTokensByUserId: mockFindRefreshTokensByUserId,
  deleteRefreshToken: mockDeleteRefreshToken,
  deleteRefreshTokensByUserId: jest.fn(),
  deleteExpiredRefreshTokens: jest.fn(),
}));

const { hashPassword, hashToken, compareToken } = await import('../../src/utils/hash.js');
const { signRefreshToken } = await import('../../src/utils/jwt.js');
const authService = await import('../../src/services/auth.service.js');

describe('auth service', () => {
  const user = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Jane',
    email: 'jane@example.com',
    password_hash: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeAll(async () => {
    user.password_hash = await hashPassword('password123');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateRefreshToken.mockResolvedValue({ id: 'token-id' });
  });

  it('refreshes tokens for valid refresh token', async () => {
    const refreshToken = signRefreshToken({ sub: user.id });
    const tokenHash = await hashToken(refreshToken);

    mockFindUserById.mockResolvedValue(user);
    mockFindRefreshTokensByUserId.mockResolvedValue([
      { id: 'stored-id', token_hash: tokenHash, expires_at: new Date(Date.now() + 60000) },
    ]);

    const result = await authService.refresh({ refreshToken });
    expect(result.accessToken).toBeDefined();
    expect(mockDeleteRefreshToken).toHaveBeenCalledWith('stored-id');
  });

  it('rejects invalid refresh token', async () => {
    await expect(authService.refresh({ refreshToken: 'invalid' })).rejects.toThrow(
      'Invalid or expired refresh token',
    );
  });

  it('logs out by deleting matching refresh token', async () => {
    const refreshToken = signRefreshToken({ sub: user.id });
    const tokenHash = await hashToken(refreshToken);

    mockFindRefreshTokensByUserId.mockResolvedValue([
      { id: 'stored-id', token_hash: tokenHash, expires_at: new Date(Date.now() + 60000) },
    ]);

    await authService.logout({ refreshToken, userId: user.id });
    expect(mockDeleteRefreshToken).toHaveBeenCalledWith('stored-id');
  });

  it('rejects logout with unknown refresh token', async () => {
    mockFindRefreshTokensByUserId.mockResolvedValue([]);
    await expect(
      authService.logout({ refreshToken: 'missing', userId: user.id }),
    ).rejects.toThrow('Invalid refresh token');
  });
});
