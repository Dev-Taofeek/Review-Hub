import { Router } from 'express';
import * as moderationController from '../controllers/moderation.controller';
import { authenticate, requireModerator } from '../middlewares/auth';

const router = Router();

router.use(authenticate, requireModerator);

router.get('/reviews', moderationController.getModerationQueue);
router.get('/stats', moderationController.getModerationStats);
router.get('/logs', moderationController.getModerationLogs);
router.patch('/reviews/:id/approve', moderationController.approveReview);
router.patch('/reviews/:id/reject', moderationController.rejectReview);
router.patch('/reviews/:id/flag', moderationController.flagReview);

export default router;
