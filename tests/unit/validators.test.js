import { registerSchema, loginSchema, refreshTokenSchema } from '../../src/validators/auth.validator.js';
import { createUrlSchema } from '../../src/validators/url.validator.js';
import { updateProfileSchema } from '../../src/validators/user.validator.js';

describe('auth validators', () => {
  it('validates register payload', () => {
    const result = registerSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects weak register password', () => {
    const result = registerSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('validates login payload', () => {
    const result = loginSchema.safeParse({
      email: 'jane@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('validates refresh token payload', () => {
    const result = refreshTokenSchema.safeParse({ refreshToken: 'token' });
    expect(result.success).toBe(true);
  });
});

describe('url validators', () => {
  it('validates create url payload', () => {
    const result = createUrlSchema.safeParse({
      original_url: 'https://example.com',
      short_code: 'my-link',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid url', () => {
    const result = createUrlSchema.safeParse({ original_url: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});

describe('user validators', () => {
  it('requires at least one profile field', () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
