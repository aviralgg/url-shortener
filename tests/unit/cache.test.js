import { jest } from '@jest/globals';

const mockRedisGet = jest.fn();
const mockRedisSet = jest.fn();
const mockRedisDel = jest.fn();
const mockRedisPing = jest.fn();
const mockRedisConnect = jest.fn();

class MockRedis {
  constructor() {
    this.status = 'wait';
  }

  connect = mockRedisConnect.mockImplementation(async () => {
    this.status = 'ready';
  });

  get = mockRedisGet;
  set = mockRedisSet;
  del = mockRedisDel;
  ping = mockRedisPing;
}

await jest.unstable_mockModule('ioredis', () => ({
  default: MockRedis,
}));

const redisModule = await import('../../src/cache/redis.js');

describe('redis cache helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('connects to redis when not ready', async () => {
    redisModule.redisClient.status = 'wait';
    await redisModule.connectRedis();
    expect(mockRedisConnect).toHaveBeenCalled();
  });

  it('gets and parses cached json', async () => {
    mockRedisGet.mockResolvedValue(JSON.stringify({ ok: true }));
    const value = await redisModule.cacheGet('key');
    expect(value).toEqual({ ok: true });
  });

  it('sets cache with ttl', async () => {
    await redisModule.cacheSet('key', { ok: true }, 120);
    expect(mockRedisSet).toHaveBeenCalledWith('key', JSON.stringify({ ok: true }), 'EX', 120);
  });

  it('checks redis health', async () => {
    mockRedisPing.mockResolvedValue('PONG');
    await expect(redisModule.checkRedis()).resolves.toBe(true);
  });
});
