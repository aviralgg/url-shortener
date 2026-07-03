import { query } from '../database/pg.js';

export const createUser = async ({ id, name, email, passwordHash }) => {
  const result = await query(
    `INSERT INTO users (id, name, email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, created_at, updated_at`,
    [id, name, email, passwordHash],
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await query(
    'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
    [id],
  );
  return result.rows[0] || null;
};

export const updateUser = async (id, { name, email }) => {
  const result = await query(
    `UPDATE users
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, created_at, updated_at`,
    [id, name ?? null, email ?? null],
  );
  return result.rows[0] || null;
};

export const deleteUser = async (id) => {
  await query('DELETE FROM users WHERE id = $1', [id]);
};
