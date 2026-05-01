/**
 * Category Routes
 * GET    /api/categories     - Get all categories
 * GET    /api/categories/:id - Get single category
 * POST   /api/categories     - Create category
 * PUT    /api/categories/:id - Update category
 * DELETE /api/categories/:id - Delete category (Admin only)
 */

import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = Router();

// GET routes - public or authenticated
router.get('/', verifyToken, getCategories);
router.get('/:id', verifyToken, getCategory);

// POST/PUT/DELETE routes - authenticated and admin-only
router.post('/', verifyToken, requireAdmin, createCategory);
router.put('/:id', verifyToken, requireAdmin, updateCategory);
router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

export default router;
