import { jest } from '@jest/globals';

const mockQueueGetJobCounts = jest.fn();
const mockQueueConstructor = jest.fn();
const mockRedisConnect = jest.fn();

class MockQueue {
  constructor(name, options) {
    mockQueueConstructor(name, options);
  }

  getJobCounts = mockQueueGetJobCounts;
}

class MockRedis {
  connect = mockRedisConnect;
}

await jest.unstable_mockModule('bullmq', () => ({
  Queue: MockQueue,
}));

await jest.unstable_mockModule('ioredis', () => ({
  default: MockRedis,
}));

const queueModule = await import('../../src/queue/index.js');

describe('queue module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes analytics queue', async () => {
    const queue = await queueModule.initQueue();
    expect(mockRedisConnect).toHaveBeenCalled();
    expect(queue).toBeDefined();
    expect(queueModule.getQueue()).toBe(queue);
  });

  it('checks queue health', async () => {
    await queueModule.initQueue();
    mockQueueGetJobCounts.mockResolvedValue({ waiting: 0 });
    await expect(queueModule.checkQueue()).resolves.toBe(true);
  });
});
