import { checkDatabase } from '../database/pg.js';
import { checkRedis } from '../cache/redis.js';
import { checkQueue } from '../queue/index.js';

export const getHealthStatus = async () => {
  const timestamp = new Date().toISOString();
  const checks = {
    server: 'up',
    database: 'down',
    redis: 'down',
    queue: 'down',
    timestamp,
  };

  try {
    await checkDatabase();
    checks.database = 'up';
  } catch {
    checks.database = 'down';
  }

  try {
    const redisOk = await checkRedis();
    checks.redis = redisOk ? 'up' : 'down';
  } catch {
    checks.redis = 'down';
  }

  try {
    const queueOk = await checkQueue();
    checks.queue = queueOk ? 'up' : 'down';
  } catch {
    checks.queue = 'down';
  }

  const isHealthy = Object.entries(checks)
    .filter(([key]) => key !== 'timestamp')
    .every(([, value]) => value === 'up');

  return { healthy: isHealthy, checks };
};
