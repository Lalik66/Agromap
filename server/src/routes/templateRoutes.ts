import express from 'express';
import * as templateController from '../controllers/templateController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Routes accessible to all authenticated users (with proper permissions handled in controller)
router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);
router.post('/', templateController.createTemplate);
router.patch('/:id', templateController.updateTemplate);
router.patch('/:id/default', templateController.setTemplateAsDefault);
router.delete('/:id', templateController.deleteTemplate);

export default router; 