import express from 'express';
import * as offerController from '../controllers/offerController';
import { authMiddleware, restrictTo } from '../middlewares/authMiddleware';
import { UserRole } from '../models/userModel';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Routes accessible to all authenticated users
router.get('/', offerController.getOffers);
router.get('/:id', offerController.getOfferById);

// Routes for suppliers, managers and admins
router.post('/', offerController.createOffer);
router.patch('/:id', offerController.updateOffer);
router.patch('/:id/status', offerController.updateOfferStatus);
router.delete('/:id', offerController.deleteOffer);

export default router; 