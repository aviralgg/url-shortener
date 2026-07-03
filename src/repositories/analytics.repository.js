import { query } from '../database/pg.js';

export const createAnalyticsRecord = async (urlId) => {
  const result = await query(
    `INSERT INTO analytics (url_id, click_count, unique_visitors)
     VALUES ($1, 0, 0)
     ON CONFLICT (url_id) DO NOTHING
     RETURNING *`,
    [urlId],
  );
  return result.rows[0] || null;
};

export const getAnalyticsByUrlId = async (urlId) => {
  const result = await query('SELECT * FROM analytics WHERE url_id = $1', [urlId]);
  return result.rows[0] || null;
};

export const incrementClickCount = async (urlId) => {
  const result = await query(
    `UPDATE analytics
     SET click_count = click_count + 1,
         last_accessed = NOW()
     WHERE url_id = $1
     RETURNING *`,
    [urlId],
  );
  return result.rows[0] || null;
};

export const incrementUniqueVisitor = async (urlId) => {
  const result = await query(
    `UPDATE analytics
     SET unique_visitors = unique_visitors + 1,
         last_accessed = NOW()
     WHERE url_id = $1
     RETURNING *`,
    [urlId],
  );
  return result.rows[0] || null;
};

export const ensureAnalyticsExists = async (urlId) => {
  await query(
    `INSERT INTO analytics (url_id, click_count, unique_visitors)
     VALUES ($1, 0, 0)
     ON CONFLICT (url_id) DO NOTHING`,
    [urlId],
  );
};

export const recordClickEvent = async ({
  id,
  urlId,
  visitorId,
  referrer,
  browser,
  operatingSystem,
  deviceType,
  ipAddress,
  country,
}) => {
  const result = await query(
    `INSERT INTO click_events (
       id, url_id, visitor_id, referrer, browser,
       operating_system, device_type, ip_address, country
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      id,
      urlId,
      visitorId,
      referrer ?? null,
      browser ?? null,
      operatingSystem ?? null,
      deviceType ?? null,
      ipAddress ?? null,
      country ?? 'unknown',
    ],
  );
  return result.rows[0];
};

export const hasVisitorClicked = async (urlId, visitorId) => {
  const result = await query(
    'SELECT 1 FROM click_events WHERE url_id = $1 AND visitor_id = $2 LIMIT 1',
    [urlId, visitorId],
  );
  return result.rowCount > 0;
};

export const getClickEventsByUrlId = async (urlId, limit = 50) => {
  const result = await query(
    `SELECT id, visitor_id, referrer, browser, operating_system,
            device_type, ip_address, country, created_at
     FROM click_events
     WHERE url_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [urlId, limit],
  );
  return result.rows;
};
