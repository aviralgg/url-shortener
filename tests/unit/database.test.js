import { jest } from '@jest/globals';
import fs from 'fs';

const mockQuery = jest.fn();
const mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockReturnValue('CREATE TABLE test;');
const mockReaddirSync = jest.spyOn(fs, 'readdirSync').mockReturnValue(['001_init.sql']);

await jest.unstable_mockModule('pg', () => ({
  default: {
    Pool: jest.fn().mockImplementation(() => ({
      query: mockQuery,
    })),
  },
}));

const pgModule = await import('../../src/database/pg.js');

describe('database module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs queries through pool', async () => {
    mockQuery.mockResolvedValue({ rows: [{ ok: true }] });
    const result = await pgModule.query('SELECT 1');
    expect(result.rows[0].ok).toBe(true);
  });

  it('checks database connectivity', async () => {
    mockQuery.mockResolvedValue({ rows: [{ '?column?': 1 }] });
    await expect(pgModule.checkDatabase()).resolves.toBe(true);
  });

  it('runs sql migrations on init', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    await pgModule.initDb();
    expect(mockReadFileSync).toHaveBeenCalled();
    expect(mockReaddirSync).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledWith('CREATE TABLE test;');
  });
});
