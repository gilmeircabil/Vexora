import type { Request, Response, NextFunction } from 'express';
import { AuthService, type TokenPayload } from '../services/authService.js';
import { User } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this feature.',
    });
    return;
  }

  const payload = AuthService.verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please sign in again.',
    });
    return;
  }

  req.user = payload;
  next();
}

export function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    const payload = AuthService.verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Access denied. Administrative privileges are required.',
    });
    return;
  }
  next();
}

export async function requireTeacher(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this feature.',
    });
    return;
  }

  // Admins always have access
  if (req.user.role === 'admin') {
    next();
    return;
  }

  try {
    const user = await User.findById(req.user.userId).select('educationRole role');
    if (
      !user ||
      (user.educationRole !== 'teacher' &&
        user.educationRole !== 'educator' &&
        user.role !== 'admin')
    ) {
      res.status(403).json({
        success: false,
        error: 'Teacher privileges required. Unauthorized student access is prohibited.',
      });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to verify teacher authorization.',
    });
  }
}
