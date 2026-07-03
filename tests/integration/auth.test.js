import { jest } from '@jest/globals';
import request from 'supertest';

const user = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Test User',
  email: 'test@example.com',
  password_hash: '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQW5K0vVqJ5VqJ5VqJ5VqJ5VqJ5VqJ',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockCreateUser = jest.fn();
const mockFindUserByEmail = jest.fn();
const mockFindUserById = jest.fn();
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

const { hashPassword } = await import('../../src/utils/hash.js');
const { default: createApp } = await import('../../src/app.js');

describe('Auth API', () => {
  const app = createApp();

  beforeAll(async () => {
    user.password_hash = await hashPassword('password123');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user', async () => {
    mockFindUserByEmail.mockResolvedValue(null);
    mockCreateUser.mockResolvedValue(user);
    mockCreateRefreshToken.mockResolvedValue({ id: 'token-id' });

    const response = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  });

  it('rejects duplicate registration', async () => {
    mockFindUserByEmail.mockResolvedValue(user);

    const response = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('logs in with valid credentials', async () => {
    mockFindUserByEmail.mockResolvedValue(user);
    mockCreateRefreshToken.mockResolvedValue({ id: 'token-id' });

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
  });

  it('rejects invalid login', async () => {
    mockFindUserByEmail.mockResolvedValue(null);

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(401);
  });

  it('validates register payload', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'bad-email',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
