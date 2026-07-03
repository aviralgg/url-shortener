import { hashPassword, comparePassword, hashToken, compareToken } from '../../src/utils/hash.js';
import { signAccessToken, verifyAccessToken, getRefreshTokenExpiry } from '../../src/utils/jwt.js';
import { getOrCreateVisitorId, generateId } from '../../src/utils/visitor.js';

describe('hash utils', () => {
  it('hashes and compares passwords', async () => {
    const hashed = await hashPassword('secret123');
    expect(await comparePassword('secret123', hashed)).toBe(true);
    expect(await comparePassword('wrong', hashed)).toBe(false);
  });

  it('hashes and compares tokens', async () => {
    const hashed = await hashToken('refresh-token');
    expect(await compareToken('refresh-token', hashed)).toBe(true);
    expect(await compareToken('other', hashed)).toBe(false);
  });
});

describe('jwt utils', () => {
  it('signs and verifies access token', () => {
    const token = signAccessToken({ sub: 'user-1', email: 'a@b.com' });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.email).toBe('a@b.com');
  });

  it('returns refresh token expiry date', () => {
    const expiry = getRefreshTokenExpiry();
    expect(expiry instanceof Date).toBe(true);
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('visitor utils', () => {
  it('reuses provided visitor id', () => {
    const req = { headers: { 'x-visitor-id': 'visitor-123' }, ip: '1.1.1.1' };
    expect(getOrCreateVisitorId(req)).toBe('visitor-123');
  });

  it('generates deterministic visitor id', () => {
    const req = { headers: { 'user-agent': 'test-agent' }, ip: '1.1.1.1' };
    expect(getOrCreateVisitorId(req)).toHaveLength(32);
  });

  it('generates uuid ids', () => {
    expect(generateId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
