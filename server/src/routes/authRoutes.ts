import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadImage, validateImageMagicBytes } from '../middleware/uploadMiddleware.js';
import { enforceLimits } from '../middleware/limitMiddleware.js';
import { defaultLimits } from '../config/limits.js';

const router = Router();

// Security & OAuth configuration
router.get('/security-config', AuthController.securityConfig);
router.get('/oauth-config', AuthController.oauthConfig);

// Social OAuth Login (Google) - Rate limited by IP
router.post(
  '/google',
  enforceLimits({
    category: 'auth',
    action: 'login',
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: defaultLimits.auth.loginAttempts,
  }),
  AuthController.googleLogin,
);
router.get('/oauth/google/url', AuthController.getGoogleAuthUrl);
router.post(
  '/oauth/google/callback',
  enforceLimits({
    category: 'auth',
    action: 'login',
    windowMs: 15 * 60 * 1000,
    maxRequests: defaultLimits.auth.loginAttempts,
  }),
  AuthController.googleLogin,
);

// Username & Password Authentication
router.post(
  '/register',
  enforceLimits({
    category: 'auth',
    action: 'register',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: defaultLimits.auth.registerPerHour,
  }),
  AuthController.register,
);
router.post(
  '/login',
  enforceLimits({
    category: 'auth',
    action: 'login',
    windowMs: 15 * 60 * 1000,
    maxRequests: defaultLimits.auth.loginAttempts,
  }),
  AuthController.login,
);
router.post('/logout', AuthController.logout);

// Account Recovery (Recovery Code)
router.post(
  '/recover-account',
  enforceLimits({
    category: 'auth',
    action: 'passwordRecovery',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.auth.passwordRecoveryPerHour,
  }),
  AuthController.recoverAccount,
);
router.post(
  '/forgot-password',
  enforceLimits({
    category: 'auth',
    action: 'passwordRecovery',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.auth.passwordRecoveryPerHour,
  }),
  AuthController.recoverAccount,
);
router.post(
  '/reset-password',
  enforceLimits({
    category: 'auth',
    action: 'passwordRecovery',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.auth.passwordRecoveryPerHour,
  }),
  AuthController.recoverAccount,
);

// Authenticated User Session & Profile
router.get('/me', authenticate, AuthController.me);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post(
  '/avatar',
  authenticate,
  enforceLimits({
    category: 'api',
    action: 'upload',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: defaultLimits.api.uploadPerHour,
  }),
  uploadImage.single('file'),
  validateImageMagicBytes,
  AuthController.uploadAvatar,
);
router.delete('/avatar', authenticate, AuthController.deleteAvatar);
router.post('/change-password', authenticate, AuthController.changePassword);
router.post('/refresh', AuthController.refresh);

// Retired OAuth Endpoints (Return 410 Gone with clean notice)
router.use('/oauth', AuthController.retiredOAuthNotice);

export default router;
