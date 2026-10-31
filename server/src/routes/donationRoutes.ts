import { Router } from 'express';
import { DonationController } from '../controllers/donationController.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public donation endpoints
router.get('/summary', DonationController.getSummary);
router.get('/leaderboard', DonationController.getLeaderboard);
router.get('/:id/status', DonationController.getStatus);
router.post('/checkout', optionalAuthenticate, DonationController.createCheckout);
router.post('/webhook', DonationController.handleWebhook);

export default router;
