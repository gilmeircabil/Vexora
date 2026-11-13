import { Router } from 'express';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminRoutes from './adminRoutes.js';
import designRoutes from './designRoutes.js';
import designAssetRoutes from './designAssetRoutes.js';
import designTemplateRoutes from './designTemplateRoutes.js';
import donationRoutes from './donationRoutes.js';
import learningRoutes from './learningRoutes.js';
import platformRoutes from './platformRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import { educationRoutes } from './educationRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import limitRoutes from './limitRoutes.js';
import loveLinkRoutes from './loveLinkRoutes.js';
import { enforceLimits } from '../middleware/limitMiddleware.js';
import { defaultLimits } from '../config/limits.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const apiRouter = Router();

// Global API rate limiting for all API endpoints
// This runs before all route handlers
apiRouter.use((req, res, next) => {
  const userId = (req as any).user?.userId;

  // Set rate limit headers
  const limit = userId ? defaultLimits.api.authenticatedPerMinute : defaultLimits.api.guestPerMinute;

  res.setHeader('X-RateLimit-Limit', limit.toString());
  res.setHeader('X-RateLimit-Remaining', limit.toString());
  res.setHeader('X-RateLimit-Reset', String(Math.floor(Date.now() / 1000) + 60));

  next();
});

// Health check endpoint (no rate limiting)
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'VexoraMods API',
  });
});

// API routes with rate limiting
apiRouter.use('/auth', authRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/designs', designRoutes);
apiRouter.use('/design-assets', designAssetRoutes);
apiRouter.use('/design-templates', designTemplateRoutes);
apiRouter.use('/donations', donationRoutes);
apiRouter.use('/learning', learningRoutes);
apiRouter.use('/platform', platformRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/education', educationRoutes);
apiRouter.use('/favorites', favoriteRoutes);
apiRouter.use('/announcements', announcementRoutes);
apiRouter.use('/limits', limitRoutes);
apiRouter.use('/lovelink', loveLinkRoutes);

export default apiRouter;
