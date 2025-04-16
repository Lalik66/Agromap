import express from 'express';
import * as notificationController from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get all notifications for the current user
router.get('/', notificationController.getNotifications);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Mark a notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

export default router; 