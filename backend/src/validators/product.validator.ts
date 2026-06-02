import { body, query } from 'express-validator';

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 5000 }),
  body('brand').trim().notEmpty().withMessage('Brand is required').isLength({ max: 100 }),
  body('category_id')
    .optional({ checkFalsy: true })
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage('Invalid category ID format'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

export const updateProductValidator = [
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().notEmpty().isLength({ max: 5000 }),
  body('brand').optional().trim().notEmpty().isLength({ max: 100 }),
  body('category_id').optional().isUUID(),
  body('price').optional().isFloat({ min: 0 }),
  body('is_active').optional().isBoolean(),
];

export const productQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('minRating').optional().isFloat({ min: 0, max: 5 }),
  query('sortBy').optional().isIn(['price_asc', 'price_desc', 'rating_desc', 'newest', 'most_reviewed']),
];
