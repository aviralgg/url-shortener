import { nanoid } from 'nanoid';
import { config } from '../config/index.js';
import { CACHE_KEYS } from '../constants/index.js';
import { RESERVED_SHORT_CODES } from '../constants/index.js';
import { cacheGet, cacheSet, cacheDel } from '../cache/redis.js';
import { getQueue } from '../queue/index.js';
import { generateId } from '../utils/visitor.js';
import { ApiError } from '../utils/response.js';
import * as urlRepository from '../repositories/url.repository.js';
import * as analyticsRepository from '../repositories/analytics.repository.js';

const formatUrl = (url) => ({
  id: url.id,
  user_id: url.user_id,
  original_url: url.original_url,
  short_code: url.short_code,
  short_url: `${config.baseUrl}/${url.short_code}`,
  expires_at: url.expires_at,
  created_at: url.created_at,
  updated_at: url.updated_at,
});

const cacheUrl = async (url) => {
  await cacheSet(CACHE_KEYS.url(url.short_code), url);
};

const invalidateUrlCache = async (shortCode) => {
  await cacheDel(CACHE_KEYS.url(shortCode));
};

export const createShortUrl = async (userId, { original_url, short_code, expires_at }) => {
  const shortCode = short_code || nanoid(8);

  if (RESERVED_SHORT_CODES.has(shortCode.toLowerCase())) {
    throw new ApiError(400, 'Short code is reserved');
  }

  const taken = await urlRepository.isShortCodeTaken(shortCode);
  if (taken) {
    throw new ApiError(409, 'Short code already in use');
  }

  const expiresAt = expires_at ? new Date(expires_at) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    throw new ApiError(400, 'Invalid expiration date');
  }

  const url = await urlRepository.createUrl({
    id: generateId(),
    userId,
    originalUrl: original_url,
    shortCode,
    expiresAt,
  });

  await analyticsRepository.createAnalyticsRecord(url.id);
  await cacheUrl(url);

  return formatUrl(url);
};

export const listUrls = async (userId) => {
  const urls = await urlRepository.findUrlsByUserId(userId);
  return urls.map(formatUrl);
};

export const deleteUrl = async (userId, urlId) => {
  const url = await urlRepository.findUrlByIdAndUserId(urlId, userId);
  if (!url) {
    throw new ApiError(404, 'URL not found');
  }

  await urlRepository.deleteUrl(urlId);
  await invalidateUrlCache(url.short_code);
  await cacheDel(CACHE_KEYS.analytics(urlId));
};

export const resolveShortUrl = async (shortCode) => {
  let url = await cacheGet(CACHE_KEYS.url(shortCode));

  if (!url) {
    url = await urlRepository.findUrlByCode(shortCode);
    if (url) {
      await cacheUrl(url);
    }
  }

  if (!url) {
    throw new ApiError(404, 'Short URL not found');
  }

  if (url.expires_at && new Date(url.expires_at) < new Date()) {
    throw new ApiError(410, 'Short URL has expired');
  }

  return url;
};

export const enqueueAnalytics = async (urlId, metadata) => {
  const queue = getQueue();
  if (!queue) {
    return;
  }

  await queue.add(
    'click',
    { urlId, ...metadata },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
};

export const getUrlForUser = async (userId, urlId) => {
  const url = await urlRepository.findUrlByIdAndUserId(urlId, userId);
  if (!url) {
    throw new ApiError(404, 'URL not found');
  }
  return formatUrl(url);
};
