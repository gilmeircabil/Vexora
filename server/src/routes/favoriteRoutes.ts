import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, FavoriteController.getFavorites);
router.post('/sync', authenticate, FavoriteController.syncFavorites);
router.post('/:toolId', authenticate, FavoriteController.addFavorite);
router.delete('/:toolId', authenticate, FavoriteController.removeFavorite);

export default router;
