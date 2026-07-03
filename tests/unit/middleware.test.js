import { jest } from '@jest/globals';
import { ApiError } from '../../src/utils/response.js';
import { validate } from '../../src/middleware/validate.js';
import { authenticate } from '../../src/middleware/auth.js';
import { z } from 'zod';

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('validate middleware', () => {
  const schema = z.object({ name: z.string().min(1) });

  it('passes valid body to next handler', () => {
    const req = { body: { name: 'Jane' } };
    const res = createMockRes();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.name).toBe('Jane');
  });

  it('forwards validation errors', () => {
    const req = { body: { name: '' } };
    const res = createMockRes();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
  });
});

describe('authenticate middleware', () => {
  it('rejects missing authorization header', () => {
    const req = { headers: {} };
    const res = createMockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
  });
});
