import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (name) => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const requireNumber = (name) => {
  const value = Number(requireEnv(name));
  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return value;
};

export const config = {
  env: requireEnv('NODE_ENV'),
  port: requireNumber('PORT'),
  baseUrl: requireEnv('BASE_URL'),
  db: {
    host: requireEnv('DATABASE_HOST'),
    port: requireNumber('DATABASE_PORT'),
    user: requireEnv('DATABASE_USER'),
    password: requireEnv('DATABASE_PASSWORD'),
    database: requireEnv('DATABASE_NAME'),
  },
  redis: {
    host: requireEnv('REDIS_HOST'),
    port: requireNumber('REDIS_PORT'),
  },
  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExp: requireEnv('JWT_ACCESS_EXP'),
    refreshExp: requireEnv('JWT_REFRESH_EXP'),
  },
  queueName: requireEnv('QUEUE_NAME'),
  cacheTtl: requireNumber('CACHE_TTL'),
};
