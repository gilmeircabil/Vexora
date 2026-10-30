import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin routes with authentication and requireAdmin
router.use(authenticate, requireAdmin);

router.get('/users', AdminController.getUsers);
router.get('/subscriptions', AdminController.getSubscriptions);
router.get('/payments', AdminController.getPayments);
router.get('/usage', AdminController.getUsage);
router.post('/credits/adjust', AdminController.adjustCredits);
router.get('/tools', AdminController.getTools);
router.patch('/tools/:toolId', AdminController.updateTool);

export default router;
