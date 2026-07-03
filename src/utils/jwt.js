import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExp });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExp });

export const verifyAccessToken = (token) => jwt.verify(token, config.jwt.accessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

export const getRefreshTokenExpiry = () => {
  const match = config.jwt.refreshExp.match(/^(\d+)([dhms])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  return new Date(Date.now() + value * multipliers[unit]);
};
