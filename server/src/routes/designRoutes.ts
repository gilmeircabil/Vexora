import { Router } from 'express';
import { DesignProjectController } from '../controllers/designProjectController.js';
import { DesignVersionController } from '../controllers/designVersionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { enforceLimits } from '../middleware/limitMiddleware.js';
import { defaultLimits } from '../config/limits.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Project endpoints - Studio limits
router.post(
  '/',
  enforceLimits({
    category: 'studio',
    action: 'createProject',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.studio.projectsPerUser,
  }),
  DesignProjectController.create,
);
router.get('/', DesignProjectController.list);
router.get('/:projectId', DesignProjectController.getById);
router.patch(
  '/:projectId',
  enforceLimits({
    category: 'studio',
    action: 'editProject',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.studio.exportsPerHour,
  }),
  DesignProjectController.update,
);
router.delete(
  '/:projectId',
  enforceLimits({
    category: 'studio',
    action: 'deleteProject',
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
  }),
  DesignProjectController.delete,
);
router.post(
  '/:projectId/duplicate',
  enforceLimits({
    category: 'studio',
    action: 'createProject',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.studio.projectsPerUser,
  }),
  DesignProjectController.duplicate,
);
router.post(
  '/:projectId/thumbnail',
  enforceLimits({
    category: 'studio',
    action: 'editProject',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.studio.exportsPerHour,
  }),
  DesignProjectController.saveThumbnail,
);

// Version history endpoints
router.get('/:projectId/versions', DesignVersionController.listVersions);
router.post(
  '/:projectId/versions',
  enforceLimits({
    category: 'studio',
    action: 'createSnapshot',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.studio.exportsPerHour,
  }),
  DesignVersionController.createSnapshot,
);
router.get('/:projectId/versions/:versionId', DesignVersionController.getVersion);
router.post(
  '/:projectId/versions/:versionId/restore',
  enforceLimits({
    category: 'studio',
    action: 'exportProject',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.studio.exportsPerHour,
  }),
  DesignVersionController.restoreVersion,
);

export default router;
