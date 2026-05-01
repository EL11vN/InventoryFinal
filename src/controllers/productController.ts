/**
 * Product Controller
 * Handles product CRUD operations
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getFirestore } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all products with optional filtering
 */
export async function getProducts(req: AuthRequest, res: Response) {
  try {
    const { categoryId, status, search } = req.query;
    const db = getFirestore();
    let query: any = db.collection('products');

    // Apply filters
    if (categoryId) {
      query = query.where('categoryId', '==', categoryId);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    let products = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Client-side search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      products = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get single product by ID
 */
export async function getProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const db = getFirestore();
    const doc = await db.collection('products').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
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
 * Create a new product
 */
export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const {
      name,
      description,
      categoryId,
      categoryName,
      sku,
      price,
      quantity,
      minStockLevel,
      images,
      supplier,
      status = 'active',
      tags = []
    } = req.body;

    // Validate required fields
    if (!name || !categoryId || !sku || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, categoryId, sku, price'
      });
    }

    const db = getFirestore();
    const productId = uuidv4();

    const productData = {
      id: productId,
      name,
      description: description || '',
      categoryId,
      categoryName: categoryName || 'Uncategorized',
      sku,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 0,
      minStockLevel: parseInt(minStockLevel) || 0,
      images: images || [],
      supplier: supplier || '',
      status,
      tags,
      createdBy: req.user?.uid || 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUpdatedBy: req.user?.uid || 'system'
    };

    await db.collection('products').doc(productId).set(productData);

    // Log action
    await logAuditAction(req.user?.uid || 'system', 'create_product', 'product', productId, {});

    res.status(201).json({
      success: true,
      data: productData,
      message: 'Product created successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Update a product
 */
export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const db = getFirestore();

    // Get existing product for audit log
    const existingDoc = await db.collection('products').doc(id).get();
    if (!existingDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      lastUpdatedBy: req.user?.uid || 'system'
    };

    await db.collection('products').doc(id).update(updateData);

    // Log action
    const changes = {
      before: existingDoc.data(),
      after: updateData
    };
    await logAuditAction(req.user?.uid || 'system', 'update_product', 'product', id, changes);

    res.json({
      success: true,
      data: { id, ...updateData },
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Delete a product (Admin only)
 */
export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const db = getFirestore();

    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    await db.collection('products').doc(id).delete();

    // Log action
    await logAuditAction(req.user?.uid || 'system', 'delete_product', 'product', id, { deletedData: doc.data() });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Helper: Log audit action
 */
async function logAuditAction(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes: any
) {
  try {
    const db = getFirestore();
    await db.collection('auditLogs').add({
      userId,
      action,
      entityType,
      entityId,
      changes,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
