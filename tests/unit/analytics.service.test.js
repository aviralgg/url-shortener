import { jest } from '@jest/globals';

const mockEnsureAnalyticsExists = jest.fn();
const mockHasVisitorClicked = jest.fn();
const mockRecordClickEvent = jest.fn();
const mockIncrementClickCount = jest.fn();
const mockIncrementUniqueVisitor = jest.fn();
const mockCacheDel = jest.fn();

await jest.unstable_mockModule('../../src/cache/redis.js', () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  cacheDel: mockCacheDel,
}));

await jest.unstable_mockModule('../../src/repositories/analytics.repository.js', () => ({
  ensureAnalyticsExists: mockEnsureAnalyticsExists,
  hasVisitorClicked: mockHasVisitorClicked,
  recordClickEvent: mockRecordClickEvent,
  incrementClickCount: mockIncrementClickCount,
  incrementUniqueVisitor: mockIncrementUniqueVisitor,
}));

const analyticsService = await import('../../src/services/analytics.service.js');

describe('processClick', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records first-time visitor analytics', async () => {
    mockHasVisitorClicked.mockResolvedValue(false);

    await analyticsService.processClick({
      urlId: 'url-1',
      visitorId: 'visitor-1',
      referrer: 'https://google.com',
      browser: 'Chrome',
      operatingSystem: 'Linux',
      deviceType: 'desktop',
      ipAddress: '1.2.3.4',
      country: 'unknown',
    });

    expect(mockIncrementClickCount).toHaveBeenCalledWith('url-1');
    expect(mockIncrementUniqueVisitor).toHaveBeenCalledWith('url-1');
    expect(mockCacheDel).toHaveBeenCalled();
  });

  it('skips unique visitor increment for returning visitors', async () => {
    mockHasVisitorClicked.mockResolvedValue(true);

    await analyticsService.processClick({
      urlId: 'url-1',
      visitorId: 'visitor-1',
      browser: 'Chrome',
      operatingSystem: 'Linux',
      deviceType: 'desktop',
      ipAddress: '1.2.3.4',
      country: 'unknown',
    });

    expect(mockIncrementUniqueVisitor).not.toHaveBeenCalled();
  });
});
