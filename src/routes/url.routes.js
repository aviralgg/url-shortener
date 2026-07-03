import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { createUrlSchema, urlIdParamSchema } from '../validators/url.validator.js';
import * as urlController from '../controllers/url.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createUrlSchema), asyncHandler(urlController.createUrl));
router.get('/', asyncHandler(urlController.listUrls));
router.get('/:id/analytics', validate(urlIdParamSchema, 'params'), asyncHandler(urlController.getUrlAnalytics));
router.delete('/:id', validate(urlIdParamSchema, 'params'), asyncHandler(urlController.deleteUrl));

export default router;
