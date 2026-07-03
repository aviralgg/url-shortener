import 'dotenv/config';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/index.js';
import { initDb } from '../database/pg.js';
import { processClick } from '../services/analytics.service.js';

const startWorker = async () => {
  await initDb();

  const connection = new IORedis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(
    config.queueName,
    async (job) => {
      await processClick(job.data);
    },
    {
      connection,
      concurrency: 5,
    },
  );

  worker.on('completed', (job) => {
    console.log(`Analytics job ${job.id} completed`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Analytics job ${job?.id} failed:`, error.message);
  });

  console.log('Analytics worker started');
};

startWorker().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});
