import { body, param } from 'express-validator';

const VALID_REASONS = [
  'spam', 'abuse', 'hate_speech', 'fake_review',
  'misleading_content', 'offensive_language', 'other',
];

export const createReportValidator = [
  param('id').isUUID().withMessage('Invalid review ID'),
  body('reason').isIn(VALID_REASONS).withMessage('Invalid report reason'),
  body('message').optional().trim().isLength({ max: 1000 }).withMessage('Message must be under 1000 characters'),
];

export const updateReportValidator = [
  param('id').isUUID().withMessage('Invalid report ID'),
  body('status').isIn(['pending', 'reviewed', 'resolved', 'dismissed']).withMessage('Invalid status'),
];
