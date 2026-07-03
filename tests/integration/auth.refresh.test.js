import { jest } from '@jest/globals';
import request from 'supertest';

const user = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Jane',
  email: 'jane@example.com',
  password_hash: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockFindUserByEmail = jest.fn();
const mockFindUserById = jest.fn();
const mockCreateUser = jest.fn();
const mockCreateRefreshToken = jest.fn();
const mockFindRefreshTokensByUserId = jest.fn();
const mockDeleteRefreshToken = jest.fn();

await jest.unstable_mockModule('../../src/database/pg.js', () => ({
  initDb: jest.fn(),
  checkDatabase: jest.fn().mockResolvedValue(true),
  query: jest.fn(),
  default: {},
}));

await jest.unstable_mockModule('../../src/cache/redis.js', () => ({
  connectRedis: jest.fn(),
  checkRedis: jest.fn().mockResolvedValue(true),
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  cacheDel: jest.fn(),
  redisClient: {},
}));

await jest.unstable_mockModule('../../src/queue/index.js', () => ({
  initQueue: jest.fn(),
  checkQueue: jest.fn().mockResolvedValue(true),
  getQueue: jest.fn(),
}));

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

const { hashPassword, hashToken } = await import('../../src/utils/hash.js');
const { signAccessToken, signRefreshToken } = await import('../../src/utils/jwt.js');
const { default: createApp } = await import('../../src/app.js');

describe('Auth refresh and logout API', () => {
  const app = createApp();

  beforeAll(async () => {
    user.password_hash = await hashPassword('password123');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateRefreshToken.mockResolvedValue({ id: 'token-id' });
  });

  it('refreshes tokens', async () => {
    const refreshToken = signRefreshToken({ sub: user.id });
    const tokenHash = await hashToken(refreshToken);

    mockFindUserById.mockResolvedValue(user);
    mockFindRefreshTokensByUserId.mockResolvedValue([
      { id: 'stored-id', token_hash: tokenHash, expires_at: new Date(Date.now() + 60000) },
    ]);

    const response = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
  });

  it('logs out authenticated user', async () => {
    const refreshToken = signRefreshToken({ sub: user.id });
    const tokenHash = await hashToken(refreshToken);
    const accessToken = signAccessToken({ sub: user.id, email: user.email });

    mockFindRefreshTokensByUserId.mockResolvedValue([
      { id: 'stored-id', token_hash: tokenHash, expires_at: new Date(Date.now() + 60000) },
    ]);

    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(mockDeleteRefreshToken).toHaveBeenCalledWith('stored-id');
  });
});
