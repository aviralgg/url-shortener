import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const { Pool } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

export const query = (text, params) => pool.query(text, params);

export const checkDatabase = async () => {
  await pool.query('SELECT 1');
  return true;
};

export const initDb = async () => {
  const sqlDir = path.resolve(__dirname, '../../sql');
  const files = fs
    .readdirSync(sqlDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const migration = fs.readFileSync(path.join(sqlDir, file), 'utf8');
    await pool.query(migration);
  }
};

export default pool;
