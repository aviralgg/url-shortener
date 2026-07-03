import { jest } from '@jest/globals';

const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
const mockCacheDel = jest.fn();
const mockFindUrlByIdAndUserId = jest.fn();
const mockGetAnalyticsByUrlId = jest.fn();
const mockGetClickEventsByUrlId = jest.fn();
const mockEnsureAnalyticsExists = jest.fn();
const mockFindUserById = jest.fn();
const mockFindUserByEmail = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockDeleteRefreshTokensByUserId = jest.fn();

await jest.unstable_mockModule('../../src/cache/redis.js', () => ({
  cacheGet: mockCacheGet,
  cacheSet: mockCacheSet,
  cacheDel: mockCacheDel,
}));

await jest.unstable_mockModule('../../src/repositories/url.repository.js', () => ({
  findUrlByIdAndUserId: mockFindUrlByIdAndUserId,
}));

await jest.unstable_mockModule('../../src/repositories/analytics.repository.js', () => ({
  getAnalyticsByUrlId: mockGetAnalyticsByUrlId,
  getClickEventsByUrlId: mockGetClickEventsByUrlId,
  ensureAnalyticsExists: mockEnsureAnalyticsExists,
  hasVisitorClicked: jest.fn(),
  recordClickEvent: jest.fn(),
  incrementClickCount: jest.fn(),
  incrementUniqueVisitor: jest.fn(),
}));

await jest.unstable_mockModule('../../src/repositories/user.repository.js', () => ({
  findUserById: mockFindUserById,
  findUserByEmail: mockFindUserByEmail,
  updateUser: mockUpdateUser,
  deleteUser: mockDeleteUser,
}));

await jest.unstable_mockModule('../../src/repositories/refreshToken.repository.js', () => ({
  deleteRefreshTokensByUserId: mockDeleteRefreshTokensByUserId,
}));

const analyticsService = await import('../../src/services/analytics.service.js');
const userService = await import('../../src/services/user.service.js');

describe('analytics service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached analytics when available', async () => {
    mockFindUrlByIdAndUserId.mockResolvedValue({ id: 'url-1', short_code: 'abc' });
    mockCacheGet.mockResolvedValue({ click_count: 10 });

    const result = await analyticsService.getAnalytics('user-1', 'url-1');
    expect(result.click_count).toBe(10);
    expect(mockEnsureAnalyticsExists).not.toHaveBeenCalled();
  });

  it('loads analytics from database on cache miss', async () => {
    mockFindUrlByIdAndUserId.mockResolvedValue({ id: 'url-1', short_code: 'abc' });
    mockCacheGet.mockResolvedValue(null);
    mockGetAnalyticsByUrlId.mockResolvedValue({
      click_count: 3,
      unique_visitors: 2,
      last_accessed: '2026-01-01T00:00:00.000Z',
    });
    mockGetClickEventsByUrlId.mockResolvedValue([]);

    const result = await analyticsService.getAnalytics('user-1', 'url-1');
    expect(result.click_count).toBe(3);
    expect(mockCacheSet).toHaveBeenCalled();
  });
});

describe('user service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns profile for existing user', async () => {
    mockFindUserById.mockResolvedValue({ id: '1', name: 'Jane' });
    const profile = await userService.getProfile('1');
    expect(profile.name).toBe('Jane');
  });

  it('throws when profile is missing', async () => {
    mockFindUserById.mockResolvedValue(null);
    await expect(userService.getProfile('missing')).rejects.toThrow('User not found');
  });

  it('updates profile and checks email uniqueness', async () => {
    mockFindUserByEmail.mockResolvedValue(null);
    mockUpdateUser.mockResolvedValue({ id: '1', name: 'Updated', email: 'new@example.com' });

    const profile = await userService.updateProfile('1', {
      name: 'Updated',
      email: 'new@example.com',
    });

    expect(profile.email).toBe('new@example.com');
  });

  it('deletes account and refresh tokens', async () => {
    await userService.deleteAccount('1');
    expect(mockDeleteRefreshTokensByUserId).toHaveBeenCalledWith('1');
    expect(mockDeleteUser).toHaveBeenCalledWith('1');
  });
});
