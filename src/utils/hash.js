import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (plain) => bcrypt.hash(plain, SALT_ROUNDS);

export const comparePassword = async (plain, hashed) => bcrypt.compare(plain, hashed);

export const hashToken = async (token) => bcrypt.hash(token, SALT_ROUNDS);

export const compareToken = async (token, hashed) => bcrypt.compare(token, hashed);
