import { ApiResponse } from '../utils/response.js';
import * as userService from '../services/user.service.js';

export const getProfile = async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.json(ApiResponse.success(user, 'Profile retrieved'));
};

export const updateProfile = async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.json(ApiResponse.success(user, 'Profile updated'));
};

export const deleteAccount = async (req, res) => {
  await userService.deleteAccount(req.user.id);
  res.json(ApiResponse.success({}, 'Account deleted'));
};
