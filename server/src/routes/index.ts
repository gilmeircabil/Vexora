import { Router } from 'express';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminRoutes from './adminRoutes.js';
import designRoutes from './designRoutes.js';
import designAssetRoutes from './designAssetRoutes.js';
import designTemplateRoutes from './designTemplateRoutes.js';
import donationRoutes from './donationRoutes.js';
import developerRoutes from './developerRoutes.js';
import learningRoutes from './learningRoutes.js';
import platformRoutes from './platformRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import { educationRoutes } from './educationRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import announcementRoutes from './announcementRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/designs', designRoutes);
apiRouter.use('/design-assets', designAssetRoutes);
apiRouter.use('/design-templates', designTemplateRoutes);
apiRouter.use('/donations', donationRoutes);
apiRouter.use('/developers', developerRoutes);
apiRouter.use('/learning', learningRoutes);
apiRouter.use('/platform', platformRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/education', educationRoutes);
apiRouter.use('/favorites', favoriteRoutes);
apiRouter.use('/announcements', announcementRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'VexoraMods API',
  });
});

export default apiRouter;
