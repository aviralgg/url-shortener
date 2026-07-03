export const CACHE_KEYS = {
  url: (code) => `url:code:${code}`,
  analytics: (urlId) => `analytics:url:${urlId}`,
};

export const CACHE_TTL = 3600;

export const RESERVED_SHORT_CODES = new Set([
  'api',
  'health',
  'auth',
  'users',
  'urls',
  'analytics',
]);
