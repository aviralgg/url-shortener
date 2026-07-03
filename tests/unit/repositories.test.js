import { jest } from '@jest/globals';

const mockQuery = jest.fn();

await jest.unstable_mockModule('../../src/database/pg.js', () => ({
  query: mockQuery,
  checkDatabase: jest.fn(),
  initDb: jest.fn(),
  default: {},
}));

const userRepository = await import('../../src/repositories/user.repository.js');
const urlRepository = await import('../../src/repositories/url.repository.js');
const analyticsRepository = await import('../../src/repositories/analytics.repository.js');
const refreshTokenRepository = await import('../../src/repositories/refreshToken.repository.js');

describe('user repository', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('creates a user', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: '1', email: 'a@b.com' }] });
    const user = await userRepository.createUser({
      id: '1',
      name: 'Jane',
      email: 'a@b.com',
      passwordHash: 'hash',
    });
    expect(user.email).toBe('a@b.com');
  });

  it('returns null when user is not found', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const user = await userRepository.findUserByEmail('missing@b.com');
    expect(user).toBeNull();
  });
});

describe('url repository', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('checks short code availability', async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });
    const taken = await urlRepository.isShortCodeTaken('abc');
    expect(taken).toBe(true);
  });

  it('finds url by code', async () => {
    mockQuery.mockResolvedValue({ rows: [{ short_code: 'abc' }] });
    const url = await urlRepository.findUrlByCode('abc');
    expect(url.short_code).toBe('abc');
  });
});

describe('analytics repository', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('ensures analytics row exists', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    await analyticsRepository.ensureAnalyticsExists('url-1');
    expect(mockQuery).toHaveBeenCalled();
  });

  it('detects returning visitors', async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });
    const seen = await analyticsRepository.hasVisitorClicked('url-1', 'visitor-1');
    expect(seen).toBe(true);
  });
});

describe('refresh token repository', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('deletes refresh tokens for user', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    await refreshTokenRepository.deleteRefreshTokensByUserId('user-1');
    expect(mockQuery).toHaveBeenCalled();
  });
});
