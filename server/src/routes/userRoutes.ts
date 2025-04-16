import express from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';
import { authMiddleware, restrictTo } from '../middlewares/authMiddleware';
import { UserRole } from '../models/userModel';

const router = express.Router();

// Public routes
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protected routes (logged in users)
router.use(authMiddleware);

router.get('/me', authController.getMe);
router.patch('/update-me', authController.updateMe);
router.patch('/update-password', authController.updatePassword);

// Admin only routes
router.use(restrictTo(UserRole.ADMIN));

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/register').post(authController.register);

router.route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.patch('/:id/status', userController.changeUserStatus);
router.patch('/:id/reset-password', userController.resetUserPassword);

export default router; 