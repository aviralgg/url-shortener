import { jest } from '@jest/globals';

const mockQuery = jest.fn();

await jest.unstable_mockModule('../../src/database/pg.js', () => ({
  query: mockQuery,
}));

const analyticsRepository = await import('../../src/repositories/analytics.repository.js');
const urlRepository = await import('../../src/repositories/url.repository.js');

describe('repository write operations', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('creates analytics record', async () => {
    mockQuery.mockResolvedValue({ rows: [{ url_id: 'url-1' }] });
    const row = await analyticsRepository.createAnalyticsRecord('url-1');
    expect(row.url_id).toBe('url-1');
  });

  it('increments click count', async () => {
    mockQuery.mockResolvedValue({ rows: [{ click_count: 2 }] });
    const row = await analyticsRepository.incrementClickCount('url-1');
    expect(row.click_count).toBe(2);
  });

  it('records click events', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 'event-1' }] });
    const event = await analyticsRepository.recordClickEvent({
      id: 'event-1',
      urlId: 'url-1',
      visitorId: 'visitor-1',
      browser: 'Chrome',
      operatingSystem: 'Linux',
      deviceType: 'desktop',
      ipAddress: '1.2.3.4',
      country: 'unknown',
    });
    expect(event.id).toBe('event-1');
  });

  it('creates urls', async () => {
    mockQuery.mockResolvedValue({ rows: [{ short_code: 'abc' }] });
    const url = await urlRepository.createUrl({
      id: 'url-1',
      userId: 'user-1',
      originalUrl: 'https://example.com',
      shortCode: 'abc',
      expiresAt: null,
    });
    expect(url.short_code).toBe('abc');
  });

  it('updates urls', async () => {
    mockQuery.mockResolvedValue({ rows: [{ short_code: 'updated' }] });
    const url = await urlRepository.updateUrl('url-1', { originalUrl: 'https://new.com' });
    expect(url.short_code).toBe('updated');
  });
});
