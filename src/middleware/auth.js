import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/response.js';

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired access token'));
  }
};
