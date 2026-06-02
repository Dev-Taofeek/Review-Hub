import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate, requireAdmin, optionalAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createProductValidator,
  updateProductValidator,
  productQueryValidator,
} from '../validators/product.validator';

const router = Router();

router.get('/categories', productController.getCategories);
router.get('/', productQueryValidator, validate, optionalAuth, productController.getProducts);
router.get('/:id', optionalAuth, productController.getProduct);
router.post('/', authenticate, createProductValidator, validate, productController.createProduct);
router.patch('/:id', authenticate, requireAdmin, updateProductValidator, validate, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

export default router;
