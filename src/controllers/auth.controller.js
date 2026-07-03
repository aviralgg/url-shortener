import { ApiResponse } from '../utils/response.js';
import * as authService from '../services/auth.service.js';

export const register = async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(ApiResponse.success(result, 'Registration successful'));
};

export const login = async (req, res) => {
  const result = await authService.login(req.body);
  res.json(ApiResponse.success(result, 'Login successful'));
};

export const refresh = async (req, res) => {
  const result = await authService.refresh(req.body);
  res.json(ApiResponse.success(result, 'Token refreshed'));
};

export const logout = async (req, res) => {
  await authService.logout({ refreshToken: req.body.refreshToken, userId: req.user.id });
  res.json(ApiResponse.success({}, 'Logout successful'));
};
