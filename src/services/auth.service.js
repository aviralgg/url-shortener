import { generateId } from '../utils/visitor.js';
import { hashPassword, comparePassword, hashToken, compareToken } from '../utils/hash.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt.js';
import { ApiError } from '../utils/response.js';
import * as userRepository from '../repositories/user.repository.js';
import * as refreshTokenRepository from '../repositories/refreshToken.repository.js';

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const issueTokens = async (user) => {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });
  const tokenHash = await hashToken(refreshToken);

  await refreshTokenRepository.createRefreshToken({
    id: generateId(),
    userId: user.id,
    tokenHash,
    expiresAt: getRefreshTokenExpiry(),
  });

  return { accessToken, refreshToken };
};

export const register = async ({ name, email, password }) => {
  const existing = await userRepository.findUserByEmail(email);
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepository.createUser({
    id: generateId(),
    name,
    email,
    passwordHash,
  });

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const login = async ({ email, password }) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const refresh = async ({ refreshToken }) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await userRepository.findUserById(payload.sub);
  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  const storedTokens = await refreshTokenRepository.findRefreshTokensByUserId(user.id);
  let matchedToken = null;

  for (const stored of storedTokens) {
    if (new Date(stored.expires_at) < new Date()) {
      await refreshTokenRepository.deleteRefreshToken(stored.id);
      continue;
    }

    const matches = await compareToken(refreshToken, stored.token_hash);
    if (matches) {
      matchedToken = stored;
      break;
    }
  }

  if (!matchedToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  await refreshTokenRepository.deleteRefreshToken(matchedToken.id);
  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const logout = async ({ refreshToken, userId }) => {
  const storedTokens = await refreshTokenRepository.findRefreshTokensByUserId(userId);

  for (const stored of storedTokens) {
    const matches = await compareToken(refreshToken, stored.token_hash);
    if (matches) {
      await refreshTokenRepository.deleteRefreshToken(stored.id);
      return;
    }
  }

  throw new ApiError(401, 'Invalid refresh token');
};
