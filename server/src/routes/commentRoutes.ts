import express from 'express';
import * as commentController from '../controllers/commentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get comments
router.get('/', commentController.getComments);

// Add a new comment
router.post('/', commentController.addComment);

// Update a comment
router.patch('/:id', commentController.updateComment);

// Delete a comment
router.delete('/:id', commentController.deleteComment);

export default router; 