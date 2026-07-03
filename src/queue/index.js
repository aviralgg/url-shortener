import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/index.js';

let connection;
let analyticsQueue;

const createConnection = () =>
  new IORedis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

export const initQueue = async () => {
  connection = createConnection();
  await connection.connect();
  analyticsQueue = new Queue(config.queueName, { connection });
  return analyticsQueue;
};

export const getQueue = () => analyticsQueue;

export const checkQueue = async () => {
  if (!analyticsQueue) {
    return false;
  }
  await analyticsQueue.getJobCounts();
  return true;
};

export const getQueueConnection = () => connection;
