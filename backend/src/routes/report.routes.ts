import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, requireModerator } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createReportValidator, updateReportValidator } from '../validators/report.validator';

const router = Router();

router.post('/reviews/:id/report', authenticate, createReportValidator, validate, reportController.createReport);
router.get('/', authenticate, requireModerator, reportController.getReports);
router.patch('/:id', authenticate, requireModerator, updateReportValidator, validate, reportController.updateReport);

export default router;
