import Redis from 'ioredis';
import { config } from '../config/index.js';

export const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

export const connectRedis = async () => {
  if (redisClient.status === 'ready') {
    return redisClient;
  }
  await redisClient.connect();
  return redisClient;
};

export const checkRedis = async () => {
  const result = await redisClient.ping();
  return result === 'PONG';
};

export const cacheGet = async (key) => {
  const value = await redisClient.get(key);
  return value ? JSON.parse(value) : null;
};

export const cacheSet = async (key, value, ttlSeconds = config.cacheTtl) => {
  await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
};

export const cacheDel = async (key) => {
  await redisClient.del(key);
};

export default redisClient;
