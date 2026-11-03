import { Router } from 'express';
import { DeveloperController } from '../controllers/developerController.js';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware.js';
import { uploadImage, validateImageMagicBytes } from '../middleware/uploadMiddleware.js';

const router = Router();

// Developer Profiles Discovery
router.get('/', DeveloperController.searchDevelopers);
router.get('/featured', DeveloperController.getFeaturedDevelopers);

// Profile Management (Authenticated)
router.get('/profile/me', authenticate, DeveloperController.getMyProfile);
router.post('/profile', authenticate, DeveloperController.saveProfile);
router.patch('/profile', authenticate, DeveloperController.saveProfile);
router.post(
  '/profile/avatar',
  authenticate,
  uploadImage.single('file'),
  validateImageMagicBytes,
  DeveloperController.uploadAvatar,
);
router.post(
  '/profile/cover',
  authenticate,
  uploadImage.single('file'),
  validateImageMagicBytes,
  DeveloperController.uploadCover,
);

// Projects Discovery & Management
router.get('/projects', DeveloperController.searchProjects);
router.get('/projects/my', authenticate, DeveloperController.getMyProjects);
router.post('/projects', authenticate, DeveloperController.createProject);
router.get('/projects/:slug', DeveloperController.getProjectBySlug);
router.patch('/projects/:id', authenticate, DeveloperController.updateProject);
router.delete('/projects/:id', authenticate, DeveloperController.deleteProject);

// Project Engagement: Views, Reactions, Comments
router.post('/projects/:idOrSlug/view', DeveloperController.recordProjectView);
router.get(
  '/projects/:projectId/reactions',
  optionalAuthenticate,
  DeveloperController.getProjectReactions,
);
router.post(
  '/projects/:projectId/react',
  optionalAuthenticate,
  DeveloperController.toggleProjectReaction,
);
router.get('/projects/:projectId/comments', DeveloperController.getProjectComments);
router.post(
  '/projects/:projectId/comments',
  optionalAuthenticate,
  DeveloperController.addProjectComment,
);
router.delete(
  '/projects/comments/:commentId',
  authenticate,
  DeveloperController.deleteProjectComment,
);

// Abuse Reporting
router.post('/reports', optionalAuthenticate, DeveloperController.submitReport);

// Public Developer Profile View
router.get('/:username', optionalAuthenticate, DeveloperController.getProfileByUsername);

export default router;
