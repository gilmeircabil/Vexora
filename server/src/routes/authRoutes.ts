import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/refresh', AuthController.refresh);

// OAuth Social Authentication & Account Binding
router.get('/oauth/config', AuthController.oauthConfig);
router.post('/oauth/login', authRateLimiter, AuthController.oauthLogin);
router.post('/oauth/bind', authenticate, AuthController.bindOAuth);
router.delete('/oauth/unbind/:provider', authenticate, AuthController.unbindOAuth);

export default router;
