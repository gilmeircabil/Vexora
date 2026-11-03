import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcementController.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Server-Sent Events stream for instant real-time broadcasts
router.get('/stream', AnnouncementController.getSSEStream);

// Fetch active, eligible announcements (passes optional auth for user dismissal filtering)
router.get('/active', optionalAuthenticate, AnnouncementController.getActiveAnnouncements);

// Mark an announcement as dismissed
router.post('/:id/dismiss', optionalAuthenticate, AnnouncementController.dismissAnnouncement);

// Track announcement view count
router.post('/:id/view', AnnouncementController.recordView);

export default router;
