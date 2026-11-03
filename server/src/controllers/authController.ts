import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService, AuthSecurityError } from '../services/authService.js';
import { TurnstileService } from '../services/turnstileService.js';
import { StorageService } from '../services/storageService.js';
import { DeveloperProfile } from '../models/DeveloperProfile.js';
import { env } from '../config/env.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { extractClientIp } from '../middleware/rateLimitMiddleware.js';

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must not exceed 20 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores (no spaces)',
      ),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    name: z.string().optional(),
    turnstileToken: z.string().optional(),
    website: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  turnstileToken: z.string().optional(),
  website: z.string().optional(),
});

const recoverAccountSchema = z
  .object({
    username: z.string().trim().min(1, 'Username is required'),
    recoveryCode: z.string().trim().min(1, 'Recovery code is required'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
    turnstileToken: z.string().optional(),
    website: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export class AuthController {
  static async securityConfig(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        turnstileSiteKey: env.TURNSTILE_SITE_KEY,
        turnstileEnabled: Boolean(env.TURNSTILE_SITE_KEY),
      },
    });
  }

  static async register(req: Request, res: Response): Promise<void> {
    const ip = extractClientIp(req);

    try {
      // 1. Honeypot check
      if (!TurnstileService.verifyHoneypot(req.body, ip)) {
        res.status(400).json({
          success: false,
          code: 'BOT_DETECTED',
          error: 'Automated submission rejected.',
        });
        return;
      }

      // 2. Risk check
      const risk = TurnstileService.evaluateRisk(ip, req.body?.username);
      if (risk.blocked) {
        res.status(429).json({
          success: false,
          code: 'SUSPICIOUS_ACTIVITY',
          error: 'Suspicious registration activity detected. Please try again later.',
        });
        return;
      }

      // 3. Schema & confirmPassword validation
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        res.status(400).json({
          success: false,
          code: issue?.path.includes('confirmPassword') ? 'PASSWORD_MISMATCH' : 'VALIDATION_ERROR',
          error: issue?.message || 'Validation error',
        });
        return;
      }

      // 4. Cloudflare Turnstile verification
      const turnstileResult = await TurnstileService.verifyToken(parsed.data.turnstileToken, ip);
      if (!turnstileResult.success) {
        res.status(400).json({
          success: false,
          code: turnstileResult.errorCode || 'TURNSTILE_FAILED',
          error: turnstileResult.message || 'Bot verification failed.',
        });
        return;
      }

      // 5. Register with username & password (confirmPassword never stored in DB)
      const result = await AuthService.register({
        username: parsed.data.username,
        password: parsed.data.password,
        confirmPassword: parsed.data.confirmPassword,
        name: parsed.data.name,
        ip,
      });

      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          recoveryCode: result.recoveryCode,
        },
      });
    } catch (err: any) {
      const statusCode = err instanceof AuthSecurityError ? err.statusCode : 400;
      const code = err instanceof AuthSecurityError ? err.code : 'REGISTRATION_FAILED';
      res.status(statusCode).json({
        success: false,
        code,
        error: err.message || 'Registration failed',
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    const ip = extractClientIp(req);

    try {
      // 1. Honeypot check
      if (!TurnstileService.verifyHoneypot(req.body, ip)) {
        res.status(400).json({
          success: false,
          code: 'BOT_DETECTED',
          error: 'Automated submission rejected.',
        });
        return;
      }

      // 2. Schema validation
      // Accept username or email for legacy accounts
      const rawUsername = req.body?.username || req.body?.email || '';
      const parsed = loginSchema.safeParse({ ...req.body, username: rawUsername });
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          error: parsed.error.issues[0]?.message || 'Validation error',
        });
        return;
      }

      // 3. Cloudflare Turnstile bot verification
      const turnstileResult = await TurnstileService.verifyToken(parsed.data.turnstileToken, ip);
      if (!turnstileResult.success) {
        res.status(400).json({
          success: false,
          code: turnstileResult.errorCode || 'TURNSTILE_FAILED',
          error: turnstileResult.message || 'Bot verification failed.',
          requiresTurnstile: true,
        });
        return;
      }

      // 4. Authenticate credentials
      const result = await AuthService.login({
        username: parsed.data.username,
        password: parsed.data.password,
        ip,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
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
      const statusCode = err instanceof AuthSecurityError ? err.statusCode : 401;
      const code = err instanceof AuthSecurityError ? err.code : 'AUTH_FAILED';
      const risk = TurnstileService.evaluateRisk(ip, req.body?.username);

      res.status(statusCode).json({
        success: false,
        code,
        error: err.message || 'Authentication failed',
        requiresTurnstile: risk.requiresChallenge,
      });
    }
  }

  static async recoverAccount(req: Request, res: Response): Promise<void> {
    const ip = extractClientIp(req);

    try {
      if (!TurnstileService.verifyHoneypot(req.body, ip)) {
        res.status(400).json({
          success: false,
          code: 'BOT_DETECTED',
          error: 'Automated submission rejected.',
        });
        return;
      }

      // In case user sends reset token format or recoveryCode format
      const rawCode = req.body?.recoveryCode || req.body?.token || '';
      const parsed = recoverAccountSchema.safeParse({
        ...req.body,
        recoveryCode: rawCode,
      });

      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        res.status(400).json({
          success: false,
          code: issue?.path.includes('confirmPassword') ? 'PASSWORD_MISMATCH' : 'VALIDATION_ERROR',
          error: issue?.message || 'Validation error',
        });
        return;
      }

      const turnstileResult = await TurnstileService.verifyToken(parsed.data.turnstileToken, ip);
      if (!turnstileResult.success) {
        res.status(400).json({
          success: false,
          code: turnstileResult.errorCode || 'TURNSTILE_FAILED',
          error: turnstileResult.message || 'Bot verification failed.',
        });
        return;
      }

      const result = await AuthService.recoverAccount({
        username: parsed.data.username,
        recoveryCode: parsed.data.recoveryCode,
        password: parsed.data.password,
        confirmPassword: parsed.data.confirmPassword,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          newRecoveryCode: result.newRecoveryCode,
        },
      });
    } catch (err: any) {
      const statusCode = err instanceof AuthSecurityError ? err.statusCode : 400;
      const code = err instanceof AuthSecurityError ? err.code : 'RECOVERY_FAILED';
      res.status(statusCode).json({
        success: false,
        code,
        error: err.message || 'Account recovery failed',
      });
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          error: parsed.error.issues[0]?.message || 'Validation error',
        });
        return;
      }

      const result = await AuthService.changePassword({
        userId: req.user.userId,
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        confirmPassword: parsed.data.confirmPassword,
      });

      res.status(200).json(result);
    } catch (err: any) {
      const statusCode = err instanceof AuthSecurityError ? err.statusCode : 400;
      res.status(statusCode).json({
        success: false,
        code: err instanceof AuthSecurityError ? err.code : 'PASSWORD_CHANGE_FAILED',
        error: err.message || 'Failed to change password.',
      });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      AuthService.revokeToken(authHeader.substring(7));
    }
    const cookieToken = req.cookies?.refreshToken;
    if (cookieToken) {
      AuthService.revokeToken(cookieToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const user = await AuthService.getCurrentUser(req.user.userId);
      res.status(200).json({ success: true, data: user });
    } catch {
      res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const user = await AuthService.updateProfile(req.user.userId, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update profile' });
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        res.status(401).json({ success: false, error: 'Refresh token required' });
        return;
      }

      const payload = AuthService.verifyRefreshToken(token);
      if (!payload) {
        res.status(401).json({ success: false, error: 'Invalid or revoked refresh token' });
        return;
      }

      const user = await AuthService.getCurrentUser(payload.userId);
      const newTokens = AuthService.generateTokens({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      res.cookie('refreshToken', newTokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: newTokens.accessToken,
          user,
        },
      });
    } catch {
      res.status(401).json({ success: false, error: 'Failed to refresh token' });
    }
  }

  // Safe fallback for retired OAuth endpoints
  static async retiredOAuthNotice(_req: Request, res: Response): Promise<void> {
    res.status(410).json({
      success: false,
      error:
        'Social authentication has been retired. VexoraMods now uses username and password authentication exclusively.',
    });
  }

  static async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'Please choose an image file to upload.' });
        return;
      }

      const saved = await StorageService.saveAsset({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        userId: req.user.userId,
      });

      const updatedUser = await AuthService.updateProfile(req.user.userId, {
        avatarUrl: saved.url,
      });

      try {
        await DeveloperProfile.findOneAndUpdate(
          { userId: req.user.userId },
          { profileImage: saved.url },
        );
      } catch {
        // Developer profile may not exist
      }

      res.status(200).json({
        success: true,
        data: {
          avatarUrl: saved.url,
          user: updatedUser,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Avatar upload failed' });
    }
  }

  static async deleteAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const updatedUser = await AuthService.updateProfile(req.user.userId, {
        avatarUrl: '',
      });

      try {
        await DeveloperProfile.findOneAndUpdate(
          { userId: req.user.userId },
          { profileImage: '' },
        );
      } catch {
        // Ignore
      }

      res.status(200).json({
        success: true,
        data: {
          avatarUrl: '',
          user: updatedUser,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to remove avatar' });
    }
  }
}
