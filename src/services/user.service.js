import { ApiError } from '../utils/response.js';
import * as userRepository from '../repositories/user.repository.js';
import * as refreshTokenRepository from '../repositories/refreshToken.repository.js';

export const getProfile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

export const updateProfile = async (userId, data) => {
  if (data.email) {
    const existing = await userRepository.findUserByEmail(data.email);
    if (existing && existing.id !== userId) {
      throw new ApiError(409, 'Email already in use');
    }
  }

  const user = await userRepository.updateUser(userId, data);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

export const deleteAccount = async (userId) => {
  await refreshTokenRepository.deleteRefreshTokensByUserId(userId);
  await userRepository.deleteUser(userId);
};
