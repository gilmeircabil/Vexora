import { Router } from 'express';
import { DesignTemplateController } from '../controllers/designTemplateController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Browsing templates is accessible to all
router.get('/', DesignTemplateController.listTemplates);
router.get('/:templateId', DesignTemplateController.getTemplate);

// Using a template creates a project for the authenticated user
router.post('/:templateId/use', authenticate, DesignTemplateController.useTemplate);

export default router;
