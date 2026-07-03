import { jest } from '@jest/globals';

const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
const mockCacheDel = jest.fn();
const mockCreateUrl = jest.fn();
const mockFindUrlByCode = jest.fn();
const mockIsShortCodeTaken = jest.fn();
const mockCreateAnalyticsRecord = jest.fn();
const mockGetQueue = jest.fn();

await jest.unstable_mockModule('../../src/cache/redis.js', () => ({
  cacheGet: mockCacheGet,
  cacheSet: mockCacheSet,
  cacheDel: mockCacheDel,
}));

await jest.unstable_mockModule('../../src/queue/index.js', () => ({
  getQueue: mockGetQueue,
}));

await jest.unstable_mockModule('../../src/repositories/url.repository.js', () => ({
  createUrl: mockCreateUrl,
  findUrlByCode: mockFindUrlByCode,
  findUrlsByUserId: jest.fn(),
  findUrlByIdAndUserId: jest.fn(),
  deleteUrl: jest.fn(),
  updateUrl: jest.fn(),
  isShortCodeTaken: mockIsShortCodeTaken,
}));

await jest.unstable_mockModule('../../src/repositories/analytics.repository.js', () => ({
  createAnalyticsRecord: mockCreateAnalyticsRecord,
}));

const urlService = await import('../../src/services/url.service.js');

describe('url service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects reserved short codes', async () => {
    await expect(
      urlService.createShortUrl('user-1', {
        original_url: 'https://example.com',
        short_code: 'api',
      }),
    ).rejects.toThrow('Short code is reserved');
  });

  it('rejects expired urls on resolve', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockFindUrlByCode.mockResolvedValue({
      id: 'url-1',
      original_url: 'https://example.com',
      short_code: 'expired',
      expires_at: new Date(Date.now() - 1000).toISOString(),
    });

    await expect(urlService.resolveShortUrl('expired')).rejects.toThrow('Short URL has expired');
  });

  it('enqueues analytics jobs when queue is available', async () => {
    const add = jest.fn();
    mockGetQueue.mockReturnValue({ add });

    await urlService.enqueueAnalytics('url-1', { visitorId: 'visitor-1' });
    expect(add).toHaveBeenCalled();
  });
});
