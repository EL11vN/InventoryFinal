/**
 * Authentication Routes
 * POST   /api/auth/register      - Register new user
 * POST   /api/auth/login       - Login user
 * POST   /api/auth/forgot-password - Send password reset email
 * GET    /api/auth/me          - Get current user
 * PUT    /api/auth/profile     - Update user profile
 */

import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import {
  registerUser,
  loginUser,
  forgotPassword,
  getCurrentUser,
  updateUserProfile
} from '../controllers/authController';

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateUserProfile);

export default router;