process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.BASE_URL = 'http://localhost:3000';

process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_USER = 'postgres';
process.env.DATABASE_PASSWORD = 'test-password';
process.env.DATABASE_NAME = 'shortlink';

process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_EXP = '15m';
process.env.JWT_REFRESH_EXP = '7d';

process.env.QUEUE_NAME = 'analytics';
process.env.CACHE_TTL = '3600';
