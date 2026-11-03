import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadImage, validateImageMagicBytes } from '../middleware/uploadMiddleware.js';
import {
  authRateLimiter,
  registrationRateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Security / CAPTCHA configuration
router.get('/security-config', AuthController.securityConfig);

// Username & Password Authentication
router.post('/register', registrationRateLimiter, AuthController.register);
router.post('/login', loginRateLimiter, AuthController.login);
router.post('/logout', AuthController.logout);

// Account Recovery (Recovery Code)
router.post('/recover-account', passwordResetRateLimiter, AuthController.recoverAccount);
router.post('/forgot-password', passwordResetRateLimiter, AuthController.recoverAccount);
router.post('/reset-password', passwordResetRateLimiter, AuthController.recoverAccount);

// Authenticated User Session & Profile
router.get('/me', authenticate, AuthController.me);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post(
  '/avatar',
  authenticate,
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
