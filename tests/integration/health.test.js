import { jest } from '@jest/globals';
import request from 'supertest';

const mockCheckDatabase = jest.fn().mockResolvedValue(true);
const mockCheckRedis = jest.fn().mockResolvedValue(true);
const mockCheckQueue = jest.fn().mockResolvedValue(true);

await jest.unstable_mockModule('../../src/database/pg.js', () => ({
  initDb: jest.fn(),
  checkDatabase: mockCheckDatabase,
  query: jest.fn(),
  default: {},
}));

await jest.unstable_mockModule('../../src/cache/redis.js', () => ({
  connectRedis: jest.fn(),
  checkRedis: mockCheckRedis,
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  cacheDel: jest.fn(),
  redisClient: {},
}));

await jest.unstable_mockModule('../../src/queue/index.js', () => ({
  initQueue: jest.fn(),
  checkQueue: mockCheckQueue,
  getQueue: jest.fn(),
}));

const { default: createApp } = await import('../../src/app.js');

describe('Health endpoint', () => {
  const app = createApp();

  it('returns healthy status when dependencies are up', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.server).toBe('up');
    expect(response.body.data.database).toBe('up');
    expect(response.body.data.redis).toBe('up');
    expect(response.body.data.queue).toBe('up');
  });

  it('returns 503 when a dependency is down', async () => {
    mockCheckRedis.mockResolvedValueOnce(false);
    const response = await request(app).get('/health');
    expect(response.status).toBe(503);
    expect(response.body.data.redis).toBe('down');
  });
});

describe('Route handling', () => {
  const app = createApp();

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown/nested-route');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
