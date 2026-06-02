import { Response } from 'express';
import * as reportService from '../services/report.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { getPagination } from '../utils/pagination';

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await reportService.createReport(
      req.params.id,
      req.user!.id,
      req.body.reason,
      req.body.message
    );
    sendSuccess(res, report, 'Report submitted successfully', 201);
  } catch (err) {
    const message = (err as Error).message;
    const status =
      message === 'Review not found' ? 404
      : message === 'You have already reported this review' ? 409
      : message === 'Cannot report your own review' ? 400
      : 500;
    sendError(res, message || 'Failed to submit report', status);
  }
};

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pagination = getPagination(req);
    const { data, total } = await reportService.getReports(
      pagination,
      req.query.status as string
    );
    sendPaginated(res, data, total, pagination.page, pagination.limit);
  } catch {
    sendError(res, 'Failed to fetch reports', 500);
  }
};

export const updateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await reportService.updateReportStatus(
      req.params.id,
      req.body.status,
      req.user!.id
    );
    sendSuccess(res, report, 'Report updated');
  } catch {
    sendError(res, 'Failed to update report', 500);
  }
};
