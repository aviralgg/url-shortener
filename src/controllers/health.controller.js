import { ApiResponse } from '../utils/response.js';
import * as healthService from '../services/health.service.js';

export const healthCheck = async (_req, res) => {
  const status = await healthService.getHealthStatus();
  const httpStatus = status.healthy ? 200 : 503;
  res.status(httpStatus).json(ApiResponse.success(status.checks, 'Health check complete'));
};
