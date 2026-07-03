import { ApiError, ApiResponse } from '../utils/response.js';

export { ApiError, ApiResponse };

export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json(ApiResponse.error(message, errors));
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const notFoundHandler = (_req, _res, next) => {
  next(new ApiError(404, 'Route not found'));
};
