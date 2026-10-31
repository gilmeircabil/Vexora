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

// Admin Donations Management
router.get('/donations', AdminController.getDonations);
router.patch('/donations/:id', AdminController.updateDonation);
router.get('/donations/webhooks', AdminController.getDonationWebhooks);

// Admin Developer Hub Management
router.get('/developers', AdminController.getDevelopers);
router.patch('/developers/:id', AdminController.updateDeveloper);

// Admin Projects Management
router.get('/projects', AdminController.getProjects);
router.patch('/projects/:id', AdminController.updateProject);
router.delete('/projects/:id', AdminController.deleteProject);

// Admin Moderation Reports
router.get('/reports', AdminController.getReports);
router.patch('/reports/:id', AdminController.resolveReport);

export default router;
