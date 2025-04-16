import express from 'express';
import * as categoryController from '../controllers/categoryController';
import { authMiddleware, restrictTo } from '../middlewares/authMiddleware';
import { UserRole } from '../models/userModel';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Routes accessible to all authenticated users
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Routes for admins only
router.use(restrictTo(UserRole.ADMIN, UserRole.MANAGER));

router.post('/', categoryController.createCategory);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router; 