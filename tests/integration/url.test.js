import { jest } from '@jest/globals';
import request from 'supertest';

const userId = '11111111-1111-1111-1111-111111111111';
const urlId = '22222222-2222-2222-2222-222222222222';

const urlRecord = {
  id: urlId,
  user_id: userId,
  original_url: 'https://example.com',
  short_code: 'abc12345',
  expires_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockCreateUrl = jest.fn();
const mockFindUrlsByUserId = jest.fn();
const mockFindUrlByIdAndUserId = jest.fn();
const mockIsShortCodeTaken = jest.fn();
const mockFindUrlByCode = jest.fn();
const mockDeleteUrl = jest.fn();
const mockCreateAnalyticsRecord = jest.fn();
const mockGetAnalyticsByUrlId = jest.fn();
const mockGetClickEventsByUrlId = jest.fn();
const mockEnsureAnalyticsExists = jest.fn();
const mockQueueAdd = jest.fn();

await jest.unstable_mockModule('../../src/database/pg.js', () => ({
  initDb: jest.fn(),
  checkDatabase: jest.fn().mockResolvedValue(true),
  query: jest.fn(),
  default: {},
}));

await jest.unstable_mockModule('../../src/cache/redis.js', () => ({
  connectRedis: jest.fn(),
  checkRedis: jest.fn().mockResolvedValue(true),
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn(),
  cacheDel: jest.fn(),
  redisClient: {},
}));

await jest.unstable_mockModule('../../src/queue/index.js', () => ({
  initQueue: jest.fn(),
  checkQueue: jest.fn().mockResolvedValue(true),
  getQueue: jest.fn(() => ({ add: mockQueueAdd })),
}));

await jest.unstable_mockModule('../../src/repositories/url.repository.js', () => ({
  createUrl: mockCreateUrl,
  findUrlByCode: mockFindUrlByCode,
  findUrlById: jest.fn(),
  findUrlsByUserId: mockFindUrlsByUserId,
  findUrlByIdAndUserId: mockFindUrlByIdAndUserId,
  deleteUrl: mockDeleteUrl,
  updateUrl: jest.fn(),
  isShortCodeTaken: mockIsShortCodeTaken,
}));

await jest.unstable_mockModule('../../src/repositories/analytics.repository.js', () => ({
  createAnalyticsRecord: mockCreateAnalyticsRecord,
  getAnalyticsByUrlId: mockGetAnalyticsByUrlId,
  getClickEventsByUrlId: mockGetClickEventsByUrlId,
  ensureAnalyticsExists: mockEnsureAnalyticsExists,
  incrementClickCount: jest.fn(),
  incrementUniqueVisitor: jest.fn(),
  recordClickEvent: jest.fn(),
  hasVisitorClicked: jest.fn(),
}));

const { signAccessToken } = await import('../../src/utils/jwt.js');
const { default: createApp } = await import('../../src/app.js');

describe('URL API', () => {
  const app = createApp();
  const token = signAccessToken({ sub: userId, email: 'test@example.com' });
  const authHeader = { Authorization: `Bearer ${token}` };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a short url', async () => {
    mockIsShortCodeTaken.mockResolvedValue(false);
    mockCreateUrl.mockResolvedValue(urlRecord);
    mockCreateAnalyticsRecord.mockResolvedValue({});

    const response = await request(app)
      .post('/api/urls')
      .set(authHeader)
      .send({ original_url: 'https://example.com' });

    expect(response.status).toBe(201);
    expect(response.body.data.short_code).toBe('abc12345');
  });

  it('lists user urls', async () => {
    mockFindUrlsByUserId.mockResolvedValue([urlRecord]);

    const response = await request(app).get('/api/urls').set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('deletes a url', async () => {
    mockFindUrlByIdAndUserId.mockResolvedValue(urlRecord);

    const response = await request(app).delete(`/api/urls/${urlId}`).set(authHeader);

    expect(response.status).toBe(200);
    expect(mockDeleteUrl).toHaveBeenCalledWith(urlId);
  });

  it('returns analytics for a url', async () => {
    mockFindUrlByIdAndUserId.mockResolvedValue(urlRecord);
    mockEnsureAnalyticsExists.mockResolvedValue();
    mockGetAnalyticsByUrlId.mockResolvedValue({
      click_count: 5,
      unique_visitors: 2,
      last_accessed: new Date().toISOString(),
    });
    mockGetClickEventsByUrlId.mockResolvedValue([]);

    const response = await request(app).get(`/api/urls/${urlId}/analytics`).set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.data.click_count).toBe(5);
  });

  it('redirects to original url and enqueues analytics', async () => {
    mockFindUrlByCode.mockResolvedValue(urlRecord);

    const response = await request(app)
      .get('/abc12345')
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('https://example.com');
    expect(mockQueueAdd).toHaveBeenCalled();
  });
});
