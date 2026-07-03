import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const getOrCreateVisitorId = (req) => {
  const existing = req.headers['x-visitor-id'];
  if (existing && typeof existing === 'string') {
    return existing;
  }

  const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex').slice(0, 32);
};

export const generateId = () => uuidv4();
