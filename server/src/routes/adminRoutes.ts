import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { AnnouncementController } from '../controllers/announcementController.js';
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

// Admin User Account Suspension
router.patch('/users/:id/status', AdminController.updateUserStatus);

// Admin Learning Hub Management
router.get('/learning/posts', AdminController.getLearningPosts);
router.patch('/learning/posts/:id', AdminController.moderateLearningPost);
router.delete('/learning/posts/:id', AdminController.deleteLearningPost);
router.get('/learning/comments', AdminController.getLearningComments);
router.patch('/learning/comments/:id', AdminController.moderateLearningComment);
router.get('/learning/reports', AdminController.getLearningReports);
router.patch('/learning/reports/:id', AdminController.resolveLearningReport);
router.patch('/learning/reviews/:id', AdminController.moderateLearningReview);
router.get('/learning/payouts', AdminController.getLearningPayouts);
router.patch('/learning/payouts/:id', AdminController.processLearningPayout);

// Admin Platform & Homepage Configuration
router.get('/platform-config', AdminController.getPlatformConfig);
router.patch('/platform-config', AdminController.updatePlatformConfig);
router.patch('/maintenance', AdminController.updateMaintenanceConfig);

// Admin Broadcast Announcements
router.get('/announcements', AnnouncementController.getAllAnnouncements);
router.post('/announcements', AnnouncementController.createAnnouncement);
router.patch('/announcements/:id/status', AnnouncementController.updateStatus);
router.delete('/announcements/:id', AnnouncementController.deleteAnnouncement);

export default router;
