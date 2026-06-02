import { Router } from 'express';
import { getMe, updateProfile, getMyStats } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/me', authenticate, getMe);
router.get('/me/stats', authenticate, getMyStats);
router.patch('/profile', authenticate, updateProfile);

export default router;
