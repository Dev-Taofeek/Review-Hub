import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createReviewValidator, updateReviewValidator } from '../validators/review.validator';
import { reviewLimiter } from '../middlewares/rateLimiter';

const router = Router({ mergeParams: true });

// /api/reviews/me  — must be BEFORE /:id to avoid "me" matching as an id
router.get('/me', authenticate, reviewController.getMyReviews);

// /api/products/:id/reviews
router.get('/', optionalAuth, reviewController.getProductReviews);
router.post('/', authenticate, reviewLimiter, createReviewValidator, validate, reviewController.createReview);

// /api/reviews/:id
router.patch('/:id', authenticate, updateReviewValidator, validate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);
router.post('/:id/helpful', authenticate, reviewController.voteReview);

export default router;
