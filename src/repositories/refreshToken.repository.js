import { query } from '../database/pg.js';

export const createRefreshToken = async ({ id, userId, tokenHash, expiresAt }) => {
  const result = await query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, expires_at, created_at`,
    [id, userId, tokenHash, expiresAt],
  );
  return result.rows[0];
};

export const findRefreshTokensByUserId = async (userId) => {
  const result = await query(
    'SELECT id, token_hash, expires_at FROM refresh_tokens WHERE user_id = $1',
    [userId],
  );
  return result.rows;
};

export const deleteRefreshToken = async (id) => {
  await query('DELETE FROM refresh_tokens WHERE id = $1', [id]);
};

export const deleteRefreshTokensByUserId = async (userId) => {
  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};

export const deleteExpiredRefreshTokens = async () => {
  await query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
};
