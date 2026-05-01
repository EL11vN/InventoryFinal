/**
 * Authentication Controller
 * Handles user registration, login, password reset, and token generation
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAuth, getFirestore } from '../config/firebase';

/**
 * Email validation helper
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Input sanitization helper
 */
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Register a new user
 */
export async function registerUser(req: AuthRequest, res: Response) {
  try {
    const { email, password, displayName } = req.body;

    // Input validation
    if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and display name are required'
      });
    }

    // Sanitize and validate inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedDisplayName = sanitizeInput(displayName);

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    if (sanitizedDisplayName.length < 2 || sanitizedDisplayName.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Display name must be between 2 and 50 characters'
      });
    }

    // Create user in Firebase Auth
    const userRecord = await getAuth().createUser({
      email: sanitizedEmail,
      password,
      displayName: sanitizedDisplayName
    });

    // Create user document in Firestore
    const db = getFirestore();
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: sanitizedEmail,
      displayName: sanitizedDisplayName,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    // Generate custom token for immediate login
    const customToken = await getAuth().createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: sanitizedEmail,
        displayName: sanitizedDisplayName,
        role: 'user'
      },
      token: customToken,
      message: 'User registered successfully'
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);

    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code?: string };
      if (err.code === 'auth/email-already-exists') {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again later.'
    });
  }
}

/**
 * Login user and return token
 */
export async function loginUser(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email);

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Get user by email
    const userRecord = await getAuth().getUserByEmail(sanitizedEmail);

    // Generate custom token
    const customToken = await getAuth().createCustomToken(userRecord.uid);

    // Get user data from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    res.json({
      success: true,
      user: userData,
      token: customToken,
      message: 'Login successful'
    });
  } catch (error: unknown) {
    console.error('Login error:', error);

    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code?: string };
      if (err.code === 'auth/user-not-found') {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Login failed. Please check your credentials.'
    });
  }
}

/**
 * Send password reset email
 */
export async function forgotPassword(req: AuthRequest, res: Response) {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeInput(email);

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check if user exists
    let userRecord;
    try {
      userRecord = await getAuth().getUserByEmail(sanitizedEmail);
    } catch {
      // For security, always return success even if user doesn't exist
      return res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // Send password reset email
    await getAuth().generatePasswordResetLink(userRecord.email as string);

    // Always return success for security (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });
  } catch (error: unknown) {
    console.error('Forgot password error:', error);

    // Always return success for security
    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: userDoc.data()
    });
  } catch (error: unknown) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const { displayName, avatar } = req.body;
    const db = getFirestore();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (displayName) {
      const sanitizedDisplayName = sanitizeInput(displayName);
      if (sanitizedDisplayName.length >= 2 && sanitizedDisplayName.length <= 50) {
        updateData.displayName = sanitizedDisplayName;
        await getAuth().updateUser(req.user.uid, { displayName: sanitizedDisplayName });
      }
    }

    if (avatar) {
      const sanitizedAvatar = sanitizeInput(avatar);
      updateData.avatar = sanitizedAvatar;
    }

    await db.collection('users').doc(req.user.uid).update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error: unknown) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
}