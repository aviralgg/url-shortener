import { CACHE_KEYS } from '../constants/index.js';
import { cacheGet, cacheSet, cacheDel } from '../cache/redis.js';
import { generateId } from '../utils/visitor.js';
import { ApiError } from '../utils/response.js';
import * as analyticsRepository from '../repositories/analytics.repository.js';
import * as urlRepository from '../repositories/url.repository.js';

export const getAnalytics = async (userId, urlId) => {
  const url = await urlRepository.findUrlByIdAndUserId(urlId, userId);
  if (!url) {
    throw new ApiError(404, 'URL not found');
  }

  const cacheKey = CACHE_KEYS.analytics(urlId);
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return cached;
  }

  await analyticsRepository.ensureAnalyticsExists(urlId);
  const analytics = await analyticsRepository.getAnalyticsByUrlId(urlId);
  const events = await analyticsRepository.getClickEventsByUrlId(urlId);

  const payload = {
    url_id: urlId,
    short_code: url.short_code,
    click_count: Number(analytics?.click_count || 0),
    unique_visitors: Number(analytics?.unique_visitors || 0),
    last_accessed: analytics?.last_accessed || null,
    recent_clicks: events,
  };

  await cacheSet(cacheKey, payload);
  return payload;
};

export const invalidateAnalyticsCache = async (urlId) => {
  await cacheDel(CACHE_KEYS.analytics(urlId));
};

export const processClick = async ({
  urlId,
  visitorId,
  referrer,
  browser,
  operatingSystem,
  deviceType,
  ipAddress,
  country,
}) => {
  await analyticsRepository.ensureAnalyticsExists(urlId);

  const isReturningVisitor = await analyticsRepository.hasVisitorClicked(urlId, visitorId);

  await analyticsRepository.recordClickEvent({
    id: generateId(),
    urlId,
    visitorId,
    referrer,
    browser,
    operatingSystem,
    deviceType,
    ipAddress,
    country,
  });

  await analyticsRepository.incrementClickCount(urlId);

  if (!isReturningVisitor) {
    await analyticsRepository.incrementUniqueVisitor(urlId);
  }

  await invalidateAnalyticsCache(urlId);
};
