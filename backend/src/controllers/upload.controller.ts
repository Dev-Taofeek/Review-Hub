import { Response } from 'express';
import { AuthRequest } from '../types';
import * as uploadService from '../services/upload.service';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const uploadProductImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file provided');
      return;
    }

    if (!uploadService.validateImageMimeType(req.file.mimetype)) {
      sendError(res, 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed');
      return;
    }

    if (req.file.size > uploadService.MAX_FILE_SIZE) {
      sendError(res, 'File too large. Maximum size is 5MB');
      return;
    }

    const { url, publicId } = await uploadService.uploadImageBuffer(req.file.buffer, 'product');

    const { data: image } = await supabaseAdmin
      .from('product_images')
      .insert({
        product_id: req.params.productId,
        url,
        public_id: publicId,
        is_primary: req.body.is_primary === 'true',
      })
      .select()
      .single();

    sendSuccess(res, image, 'Image uploaded', 201);
  } catch {
    sendError(res, 'Failed to upload image', 500);
  }
};

export const uploadReviewImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file provided');
      return;
    }

    if (!uploadService.validateImageMimeType(req.file.mimetype)) {
      sendError(res, 'Invalid file type');
      return;
    }

    if (req.file.size > uploadService.MAX_FILE_SIZE) {
      sendError(res, 'File too large');
      return;
    }

    // Check existing image count for this review
    const { count } = await supabaseAdmin
      .from('review_images')
      .select('id', { count: 'exact', head: true })
      .eq('review_id', req.params.reviewId);

    if ((count ?? 0) >= uploadService.MAX_FILES_PER_REVIEW) {
      sendError(res, `Maximum ${uploadService.MAX_FILES_PER_REVIEW} images per review`);
      return;
    }

    const { url, publicId } = await uploadService.uploadImageBuffer(req.file.buffer, 'review');

    const { data: image } = await supabaseAdmin
      .from('review_images')
      .insert({
        review_id: req.params.reviewId,
        url,
        public_id: publicId,
      })
      .select()
      .single();

    sendSuccess(res, image, 'Image uploaded', 201);
  } catch {
    sendError(res, 'Failed to upload image', 500);
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file provided');
      return;
    }

    const { url, publicId } = await uploadService.uploadImageBuffer(req.file.buffer, 'avatar');

    await supabaseAdmin
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', req.user!.id);

    sendSuccess(res, { url, publicId }, 'Avatar uploaded');
  } catch {
    sendError(res, 'Failed to upload avatar', 500);
  }
};
