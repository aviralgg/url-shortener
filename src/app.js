import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { asyncHandler, errorHandler, notFoundHandler } from './middleware/error.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { requestLogger, errorLogger } from './middleware/logger.js';
import { validate } from './middleware/validate.js';
import { shortCodeParamSchema } from './validators/url.validator.js';
import * as healthController from './controllers/health.controller.js';
import * as urlController from './controllers/url.controller.js';

const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  app.use(rateLimiter);

  app.get('/health', asyncHandler(healthController.healthCheck));
  app.use('/api', apiRoutes);
  app.get(
    '/:shortCode',
    validate(shortCodeParamSchema, 'params'),
    asyncHandler(urlController.redirect),
  );

  app.use(notFoundHandler);
  app.use(errorLogger);
  app.use(errorHandler);

  return app;
};

export default createApp;
