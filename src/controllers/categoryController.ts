/**
 * Category Controller
 * Handles category CRUD operations
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getFirestore } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all categories
 */
export async function getCategories(req: AuthRequest, res: Response) {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('categories').get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      data: categories,
      total: categories.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get single category
 */
export async function getCategory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const db = getFirestore();
    const doc = await db.collection('categories').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Create a new category
 */
export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    const db = getFirestore();
    const categoryId = uuidv4();

    const categoryData = {
      id: categoryId,
      name,
      description: description || '',
      image: image || '',
      createdBy: req.user?.uid || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('categories').doc(categoryId).set(categoryData);

    res.status(201).json({
      success: true,
      data: categoryData,
      message: 'Category created successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Update a category
 */
export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const db = getFirestore();

    const doc = await db.collection('categories').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db.collection('categories').doc(id).update(updateData);

    res.json({
      success: true,
      data: { id, ...updateData },
      message: 'Category updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Delete a category (Admin only)
 */
export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const db = getFirestore();

    const doc = await db.collection('categories').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has products
    const products = await db.collection('products')
      .where('categoryId', '==', id)
      .get();

    if (!products.empty) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with existing products'
      });
    }

    await db.collection('categories').doc(id).delete();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
