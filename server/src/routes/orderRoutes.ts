import express from 'express';
import * as orderController from '../controllers/orderController';
import { authMiddleware, restrictTo } from '../middlewares/authMiddleware';
import { UserRole } from '../models/userModel';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Routes accessible to all authenticated users
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);

// Routes accessible to all authenticated users with proper permissions
router.patch('/:id/status', orderController.updateOrderStatus);
router.post('/:id/documents', orderController.addOrderDocument);

// Routes for managers and admins only
router.use(restrictTo(UserRole.ADMIN, UserRole.MANAGER));

router.post('/', orderController.createOrder);
router.patch('/:id', orderController.updateOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

export default router; 