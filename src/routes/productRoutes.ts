/**
 * Product Routes
 * GET    /api/products       - Get all products
 * GET    /api/products/:id   - Get single product
 * POST   /api/products       - Create product
 * PUT    /api/products/:id   - Update product
 * DELETE /api/products/:id   - Delete product (Admin only)
 */

import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';

const router = Router();

// All product routes require authentication
router.get('/', verifyToken, getProducts);
router.get('/:id', verifyToken, getProduct);
router.post('/', verifyToken, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

export default router;
