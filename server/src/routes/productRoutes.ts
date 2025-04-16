import express from 'express';
import * as productController from '../controllers/productController';
import { authMiddleware, restrictTo } from '../middlewares/authMiddleware';
import { UserRole } from '../models/userModel';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Routes accessible to all authenticated users
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Routes for admins only
router.use(restrictTo(UserRole.ADMIN, UserRole.MANAGER));

router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.patch('/:id/status', productController.updateProductStatus);
router.delete('/:id', productController.deleteProduct);

export default router; 