import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Validation error',
        });
        return;
      }

      const result = await AuthService.register(parsed.data);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Registration failed',
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Validation error',
        });
        return;
      }

      const result = await AuthService.login(parsed.data);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        error: err.message || 'Authentication failed',
      });
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken');
    res.status(200).json({
      success: true,
      message: 'Signed out successfully.',
    });
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const user = await AuthService.getCurrentUser(req.user.userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        error: err.message || 'User not found',
      });
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ success: false, error: 'No refresh token provided' });
      return;
    }

    const payload = AuthService.verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({ success: false, error: 'Expired or invalid session' });
      return;
    }

    const tokens = AuthService.generateTokens(payload);
    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
      },
    });
  }
}
