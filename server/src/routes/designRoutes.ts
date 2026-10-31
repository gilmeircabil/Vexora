import { Router } from 'express';
import { DesignProjectController } from '../controllers/designProjectController.js';
import { DesignVersionController } from '../controllers/designVersionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Project endpoints
router.post('/', DesignProjectController.create);
router.get('/', DesignProjectController.list);
router.get('/:projectId', DesignProjectController.getById);
router.patch('/:projectId', DesignProjectController.update);
router.delete('/:projectId', DesignProjectController.delete);
router.post('/:projectId/duplicate', DesignProjectController.duplicate);
router.post('/:projectId/thumbnail', DesignProjectController.saveThumbnail);

// Version history endpoints
router.get('/:projectId/versions', DesignVersionController.listVersions);
router.post('/:projectId/versions', DesignVersionController.createSnapshot);
router.get('/:projectId/versions/:versionId', DesignVersionController.getVersion);
router.post('/:projectId/versions/:versionId/restore', DesignVersionController.restoreVersion);

export default router;
