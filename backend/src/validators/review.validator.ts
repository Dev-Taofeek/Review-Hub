import { body } from 'express-validator';

export const createReviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().notEmpty().withMessage('Review title is required').isLength({ min: 3, max: 200 }),
  body('body').trim().notEmpty().withMessage('Review body is required').isLength({ min: 10, max: 5000 }),
  body('pros').optional().isArray({ max: 10 }).withMessage('Pros must be an array of up to 10 items'),
  body('pros.*').optional().trim().isLength({ max: 200 }),
  body('cons').optional().isArray({ max: 10 }).withMessage('Cons must be an array of up to 10 items'),
  body('cons.*').optional().trim().isLength({ max: 200 }),
];

export const updateReviewValidator = [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('title').optional().trim().notEmpty().isLength({ min: 3, max: 200 }),
  body('body').optional().trim().notEmpty().isLength({ min: 10, max: 5000 }),
  body('pros').optional().isArray({ max: 10 }),
  body('cons').optional().isArray({ max: 10 }),
];
