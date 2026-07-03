import { RateLimiterMemory } from 'rate-limiter-flexible';
import { ApiResponse } from '../utils/response.js';

const limiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

export const rateLimiter = async (req, res, next) => {
  try {
    await limiter.consume(req.ip);
    return next();
  } catch {
    return res.status(429).json(ApiResponse.error('Too many requests'));
  }
};
