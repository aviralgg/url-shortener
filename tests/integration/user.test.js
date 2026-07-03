import { jest } from '@jest/globals';
import request from 'supertest';

const userId = '11111111-1111-1111-1111-111111111111';

const mockFindUserById = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockDeleteRefreshTokensByUserId = jest.fn();
const mockFindUserByEmail = jest.fn();

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
  findUserById: mockFindUserById,
  findUserByEmail: mockFindUserByEmail,
  updateUser: mockUpdateUser,
  deleteUser: mockDeleteUser,
  createUser: jest.fn(),
}));

await jest.unstable_mockModule('../../src/repositories/refreshToken.repository.js', () => ({
  deleteRefreshTokensByUserId: mockDeleteRefreshTokensByUserId,
  createRefreshToken: jest.fn(),
  findRefreshTokensByUserId: jest.fn(),
  deleteRefreshToken: jest.fn(),
  deleteExpiredRefreshTokens: jest.fn(),
}));

const { signAccessToken } = await import('../../src/utils/jwt.js');
const { default: createApp } = await import('../../src/app.js');

describe('User API', () => {
  const app = createApp();
  const token = signAccessToken({ sub: userId, email: 'test@example.com' });
  const authHeader = { Authorization: `Bearer ${token}` };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets profile', async () => {
    mockFindUserById.mockResolvedValue({
      id: userId,
      name: 'Jane',
      email: 'test@example.com',
    });

    const response = await request(app).get('/api/users/profile').set(authHeader);
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Jane');
  });

  it('updates profile', async () => {
    mockFindUserByEmail.mockResolvedValue(null);
    mockUpdateUser.mockResolvedValue({
      id: userId,
      name: 'Updated',
      email: 'test@example.com',
    });

    const response = await request(app)
      .put('/api/users/profile')
      .set(authHeader)
      .send({ name: 'Updated' });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Updated');
  });

  it('deletes account', async () => {
    const response = await request(app).delete('/api/users/account').set(authHeader);
    expect(response.status).toBe(200);
    expect(mockDeleteRefreshTokensByUserId).toHaveBeenCalledWith(userId);
    expect(mockDeleteUser).toHaveBeenCalledWith(userId);
  });
});
