import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { updateProfileSchema } from '../validators/user.validator.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate);

router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', validate(updateProfileSchema), asyncHandler(userController.updateProfile));
router.delete('/account', asyncHandler(userController.deleteAccount));

export default router;
