import { ApiError, ApiResponse } from '../../src/utils/response.js';

describe('ApiResponse', () => {
  it('creates success response', () => {
    expect(ApiResponse.success({ id: 1 }, 'ok')).toEqual({
      success: true,
      data: { id: 1 },
      message: 'ok',
    });
  });

  it('creates error response', () => {
    expect(ApiResponse.error('failed', [{ field: 'email' }])).toEqual({
      success: false,
      message: 'failed',
      errors: [{ field: 'email' }],
    });
  });
});

describe('ApiError', () => {
  it('stores status and errors', () => {
    const error = new ApiError(400, 'Bad request', [{ field: 'name' }]);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error.errors).toEqual([{ field: 'name' }]);
  });
});
