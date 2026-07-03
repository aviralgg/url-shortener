import { query } from '../database/pg.js';

export const createUrl = async ({ id, userId, originalUrl, shortCode, expiresAt }) => {
  const result = await query(
    `INSERT INTO urls (id, user_id, original_url, short_code, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, userId, originalUrl, shortCode, expiresAt ?? null],
  );
  return result.rows[0];
};

export const findUrlByCode = async (shortCode) => {
  const result = await query('SELECT * FROM urls WHERE short_code = $1', [shortCode]);
  return result.rows[0] || null;
};

export const findUrlById = async (id) => {
  const result = await query('SELECT * FROM urls WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const findUrlsByUserId = async (userId) => {
  const result = await query(
    'SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  return result.rows;
};

export const findUrlByIdAndUserId = async (id, userId) => {
  const result = await query('SELECT * FROM urls WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rows[0] || null;
};

export const deleteUrl = async (id) => {
  await query('DELETE FROM urls WHERE id = $1', [id]);
};

export const updateUrl = async (id, { originalUrl, expiresAt }) => {
  const result = await query(
    `UPDATE urls
     SET original_url = COALESCE($2, original_url),
         expires_at = COALESCE($3, expires_at),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, originalUrl ?? null, expiresAt ?? null],
  );
  return result.rows[0] || null;
};

export const isShortCodeTaken = async (shortCode) => {
  const result = await query('SELECT 1 FROM urls WHERE short_code = $1', [shortCode]);
  return result.rowCount > 0;
};
