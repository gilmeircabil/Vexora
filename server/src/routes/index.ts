import { Router } from 'express';
import authRoutes from './authRoutes.js';
import creditRoutes from './creditRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminRoutes from './adminRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/credits', creditRoutes);
apiRouter.use('/subscriptions', subscriptionRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/admin', adminRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ToolNest API',
  });
});

export default apiRouter;
