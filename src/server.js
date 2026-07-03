import 'dotenv/config';
import createApp from './app.js';
import { config } from './config/index.js';
import { initDb } from './database/pg.js';
import { connectRedis } from './cache/redis.js';
import { initQueue } from './queue/index.js';

const start = async () => {
  try {
    await initDb();
    await connectRedis();
    await initQueue();

    const app = createApp();
    app.listen(config.port, () => {
      console.log(`ShortLink API listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
