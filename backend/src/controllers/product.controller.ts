import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { AuthRequest, ProductFilters } from '../types';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { getPagination } from '../utils/pagination';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagination = getPagination(req);
    const filters: ProductFilters = {
      category: req.query.category as string,
      brand: req.query.brand as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      search: req.query.search as string,
      sortBy: req.query.sortBy as ProductFilters['sortBy'],
    };

    const { data, total } = await productService.getProducts(filters, pagination);
    sendPaginated(res, data, total, pagination.page, pagination.limit);
  } catch {
    sendError(res, 'Failed to fetch products', 500);
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isUuid = /^[0-9a-f-]{36}$/i.test(id);
    const product = isUuid
      ? await productService.getProductById(id)
      : await productService.getProductBySlug(id);

    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }

    const distribution = await productService.getProductRatingDistribution(product.id);
    sendSuccess(res, { ...product, rating_distribution: distribution });
  } catch {
    sendError(res, 'Product not found', 404);
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body, req.user!.id);
    sendSuccess(res, product, 'Product created', 201);
  } catch (err) {
    sendError(res, (err as Error).message || 'Failed to create product', 500);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    sendSuccess(res, product, 'Product updated');
  } catch {
    sendError(res, 'Failed to update product', 500);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await productService.deleteProduct(req.params.id);
    sendSuccess(res, null, 'Product deleted');
  } catch {
    sendError(res, 'Failed to delete product', 500);
  }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await import('../config/supabase').then(({ supabaseAdmin }) =>
      supabaseAdmin.from('categories').select('*').order('name')
    );
    if (error) throw error;
    sendSuccess(res, data);
  } catch {
    sendError(res, 'Failed to fetch categories', 500);
  }
};
