import { Response } from 'express';
import * as reviewService from '../services/review.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { getPagination } from '../utils/pagination';

export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pagination = getPagination(req);
    const { data, total } = await reviewService.getProductReviews(
      req.params.id,
      pagination,
      req.user?.id
    );
    sendPaginated(res, data, total, pagination.page, pagination.limit);
  } catch {
    sendError(res, 'Failed to fetch reviews', 500);
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { review, spamFlags, status } = await reviewService.createReview(
      req.params.id,
      req.user!.id,
      req.body
    );

    const message =
      status === 'published'
        ? 'Review published successfully'
        : status === 'flagged'
        ? 'Your review has been flagged for moderation'
        : 'Your review is pending moderation';

    sendSuccess(res, { review, spamFlags: spamFlags.length > 0 ? spamFlags : undefined }, message, 201);
  } catch (err) {
    const message = (err as Error).message;
    sendError(res, message || 'Failed to create review', message === 'You have already reviewed this product' ? 409 : 500);
  }
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await reviewService.updateReview(
      req.params.id,
      req.user!.id,
      req.body
    );
    sendSuccess(res, review, 'Review updated');
  } catch (err) {
    const message = (err as Error).message;
    const status = message === 'Unauthorized' ? 403 : message === 'Review not found' ? 404 : 500;
    sendError(res, message || 'Failed to update review', status);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isMod = req.user!.role === 'moderator' || req.user!.role === 'admin';
    await reviewService.deleteReview(req.params.id, req.user!.id, isMod);
    sendSuccess(res, null, 'Review deleted');
  } catch (err) {
    const message = (err as Error).message;
    sendError(res, message || 'Failed to delete review', message === 'Unauthorized' ? 403 : 500);
  }
};

export const voteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isHelpful = req.body.is_helpful !== false;
    const result = await reviewService.voteReview(req.params.id, req.user!.id, isHelpful);
    sendSuccess(res, result);
  } catch (err) {
    sendError(res, (err as Error).message || 'Failed to vote', 400);
  }
};

export const getMyReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pagination = getPagination(req);
    const { data, total } = await reviewService.getUserReviews(req.user!.id, pagination);
    sendPaginated(res, data, total, pagination.page, pagination.limit);
  } catch {
    sendError(res, 'Failed to fetch reviews', 500);
  }
};
