import { ApiError } from '../utils/response.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const data = source === 'params' ? req.params : source === 'query' ? req.query : req.body;
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(new ApiError(400, 'Validation failed', errors));
  }

  if (source === 'body') {
    req.body = result.data;
  } else if (source === 'params') {
    req.params = result.data;
  } else {
    req.query = result.data;
  }

  return next();
};
