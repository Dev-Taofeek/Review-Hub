import { Response } from 'express';
import * as moderationService from '../services/moderation.service';
import { AuthRequest, ReviewStatus } from '../types';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { getPagination } from '../utils/pagination';

export const getModerationQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pagination = getPagination(req);
    const status = req.query.status as ReviewStatus | undefined;
    const { data, total } = await moderationService.getModerationQueue(pagination, status);
    sendPaginated(res, data, total, pagination.page, pagination.limit);
  } catch {
    sendError(res, 'Failed to fetch moderation queue', 500);
  }
};

export const approveReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await moderationService.moderateReview(
      req.params.id,
      req.user!.id,
      'approved',
      req.body.reason
    );
    sendSuccess(res, review, 'Review approved');
  } catch {
    sendError(res, 'Failed to approve review', 500);
  }
};

export const rejectReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await moderationService.moderateReview(
      req.params.id,
      req.user!.id,
      'rejected',
      req.body.reason
    );
    sendSuccess(res, review, 'Review rejected');
  } catch {
    sendError(res, 'Failed to reject review', 500);
  }
};

export const flagReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await moderationService.moderateReview(
      req.params.id,
      req.user!.id,
      'flagged',
      req.body.reason
    );
    sendSuccess(res, review, 'Review flagged');
  } catch {
    sendError(res, 'Failed to flag review', 500);
  }
};

export const getModerationStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await moderationService.getModerationStats();
    sendSuccess(res, stats);
  } catch {
    sendError(res, 'Failed to fetch stats', 500);
  }
};

export const getModerationLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pagination = getPagination(req);
    const { data, total } = await moderationService.getModerationLogs(pagination);
    sendPaginated(res, data, total, pagination.page, pagination.limit);
  } catch {
    sendError(res, 'Failed to fetch logs', 500);
  }
};
