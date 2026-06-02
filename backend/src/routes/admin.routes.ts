import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role',   adminController.updateUserRole);
router.patch('/users/:id/ban',    adminController.banUser);
router.patch('/users/:id/verify', adminController.verifyUser);
router.patch('/users/:id/vote',   adminController.setVotePermission);

export default router;
