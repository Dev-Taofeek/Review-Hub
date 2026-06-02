import { Router } from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth';
import { uploadLimiter } from '../middlewares/rateLimiter';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();

router.post(
  '/products/:productId',
  authenticate,
  uploadLimiter,
  upload.single('image'),
  uploadController.uploadProductImage
);

router.post(
  '/reviews/:reviewId',
  authenticate,
  uploadLimiter,
  upload.single('image'),
  uploadController.uploadReviewImage
);

router.post(
  '/avatar',
  authenticate,
  uploadLimiter,
  upload.single('avatar'),
  uploadController.uploadAvatar
);

export default router;
