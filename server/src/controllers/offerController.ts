import { Request, Response, NextFunction } from 'express';
import Offer, { OfferStatus } from '../models/offerModel';
import Product from '../models/productModel';
import { AppError } from '../middlewares/errorMiddleware';
import Activity, { ActivityType } from '../models/activityModel';
import { UserRole } from '../models/userModel';
import Notification, { NotificationType } from '../models/notificationModel';

// Get all offers with filters
export const getOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // If user is a supplier, only show their offers
    if (req.user.role === UserRole.SUPPLIER) {
      queryObj.supplier = req.user._id;
    }
    
    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortBy = req.query.sort ? (req.query.sort as string).split(',').join(' ') : '-createdAt';
    
    // Find offers
    const offers = await Offer.find(JSON.parse(queryStr))
      .populate('product', 'name code images')
      .populate('supplier', 'name company')
      .populate('reviewedBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort(sortBy);
    
    // Count total
    const total = await Offer.countDocuments(JSON.parse(queryStr));
    
    res.status(200).json({
      status: 'success',
      results: offers.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: {
        offers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single offer by ID
export const getOfferById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('product', 'name code description images specifications category')
      .populate('supplier', 'name company email phone')
      .populate('reviewedBy', 'name');
    
    if (!offer) {
      return next(new AppError('Offer not found', 404));
    }
    
    // Check if the user has access to this offer
    if (req.user.role === UserRole.SUPPLIER && offer.supplier.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to view this offer', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        offer,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new offer
export const createOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      product,
      price,
      quantity,
      unit,
      expiresAt,
      deliveryTerms,
      paymentTerms,
      notes,
      mixOrderId,
    } = req.body;
    
    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return next(new AppError('Product not found', 404));
    }
    
    // Create offer
    const newOffer = await Offer.create({
      product,
      supplier: req.user._id,
      price,
      quantity,
      unit,
      expiresAt,
      status: OfferStatus.NEGOTIATING,
      deliveryTerms,
      paymentTerms,
      notes,
      mixOrderId,
      history: [
        {
          status: OfferStatus.NEGOTIATING,
          updatedBy: req.user._id,
          updatedAt: new Date(),
          notes: 'Offer created',
        },
      ],
    });
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.OFFER_CREATED,
      description: `Offer for ${productExists.name} was created`,
      relatedModel: 'Offer',
      relatedId: newOffer._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Notify managers
    const managers = await require('../models/userModel').default.find({ role: UserRole.MANAGER });
    for (const manager of managers) {
      await Notification.create({
        user: manager._id,
        type: NotificationType.OFFER_STATUS_CHANGE,
        title: 'New Offer Created',
        message: `A new offer for ${productExists.name} has been created by ${req.user.name}`,
        relatedModel: 'Offer',
        relatedId: newOffer._id,
      });
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        offer: newOffer,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update an offer
export const updateOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      price,
      quantity,
      unit,
      expiresAt,
      deliveryTerms,
      paymentTerms,
      notes,
      mixOrderId,
    } = req.body;
    
    // Find offer
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return next(new AppError('Offer not found', 404));
    }
    
    // Check permissions
    if (req.user.role === UserRole.SUPPLIER && offer.supplier.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to update this offer', 403));
    }
    
    // Check if offer can be updated
    if ([OfferStatus.APPROVED, OfferStatus.REJECTED, OfferStatus.EXPIRED].includes(offer.status)) {
      return next(new AppError(`Cannot update offer in ${offer.status} status`, 400));
    }
    
    // Update offer
    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      {
        price,
        quantity,
        unit,
        expiresAt,
        deliveryTerms,
        paymentTerms,
        notes,
        mixOrderId,
      },
      { new: true, runValidators: true }
    );
    
    // Add record to history
    offer.history.push({
      status: offer.status,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      notes: 'Offer updated',
    });
    await offer.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.OFFER_UPDATED,
      description: `Offer ${offer._id} was updated`,
      relatedModel: 'Offer',
      relatedId: offer._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Notify relevant parties
    if (req.user.role === UserRole.SUPPLIER) {
      // Notify managers
      const managers = await require('../models/userModel').default.find({ role: UserRole.MANAGER });
      for (const manager of managers) {
        await Notification.create({
          user: manager._id,
          type: NotificationType.OFFER_STATUS_CHANGE,
          title: 'Offer Updated',
          message: `An offer has been updated by supplier ${req.user.name}`,
          relatedModel: 'Offer',
          relatedId: offer._id,
        });
      }
    } else {
      // Notify supplier
      await Notification.create({
        user: offer.supplier,
        type: NotificationType.OFFER_STATUS_CHANGE,
        title: 'Offer Updated',
        message: `Your offer has been updated by ${req.user.name}`,
        relatedModel: 'Offer',
        relatedId: offer._id,
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        offer: updatedOffer,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update offer status
export const updateOfferStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, rejectionReason } = req.body;
    
    // Validate status
    if (!Object.values(OfferStatus).includes(status as OfferStatus)) {
      return next(new AppError('Invalid status', 400));
    }
    
    // Find offer
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return next(new AppError('Offer not found', 404));
    }
    
    // Check permissions
    if (req.user.role === UserRole.SUPPLIER) {
      // Suppliers can only change their own offers to specific statuses
      if (offer.supplier.toString() !== req.user._id.toString()) {
        return next(new AppError('You do not have permission to update this offer', 403));
      }
      
      // Suppliers can only set offer to PENDING_APPROVAL or cancel their NEGOTIATING offers
      const allowedStatusChanges: Record<OfferStatus, OfferStatus[]> = {
        [OfferStatus.NEGOTIATING]: [OfferStatus.PENDING_APPROVAL],
        [OfferStatus.PENDING_APPROVAL]: [],
        [OfferStatus.APPROVED]: [],
        [OfferStatus.REJECTED]: [],
        [OfferStatus.EXPIRED]: []
      };
      
      if (!allowedStatusChanges[offer.status]?.includes(status as OfferStatus)) {
        return next(new AppError(`Cannot change offer status from ${offer.status} to ${status}`, 400));
      }
    }
    
    // Update status
    offer.status = status as OfferStatus;
    offer.reviewedBy = req.user._id;
    offer.reviewedAt = new Date();
    
    if (status === OfferStatus.REJECTED && rejectionReason) {
      offer.rejectionReason = rejectionReason;
    }
    
    await offer.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.OFFER_STATUS_CHANGED,
      description: `Offer status changed to ${status}`,
      relatedModel: 'Offer',
      relatedId: offer._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Notify relevant parties
    if (req.user.role !== UserRole.SUPPLIER) {
      // Notify supplier
      await Notification.create({
        user: offer.supplier,
        type: NotificationType.OFFER_STATUS_CHANGE,
        title: `Offer ${status.replace('_', ' ')}`,
        message: `Your offer has been ${status.replace('_', ' ')} by ${req.user.name}${
          status === OfferStatus.REJECTED && rejectionReason ? `. Reason: ${rejectionReason}` : ''
        }`,
        relatedModel: 'Offer',
        relatedId: offer._id,
      });
    } else {
      // Notify managers
      const managers = await require('../models/userModel').default.find({ role: UserRole.MANAGER });
      for (const manager of managers) {
        await Notification.create({
          user: manager._id,
          type: NotificationType.OFFER_STATUS_CHANGE,
          title: 'Offer Submitted for Approval',
          message: `An offer has been submitted for approval by supplier ${req.user.name}`,
          relatedModel: 'Offer',
          relatedId: offer._id,
        });
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        offer,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete an offer
export const deleteOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return next(new AppError('Offer not found', 404));
    }
    
    // Check permissions
    if (req.user.role === UserRole.SUPPLIER && offer.supplier.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to delete this offer', 403));
    }
    
    // Only allow deletion of offers in NEGOTIATING or REJECTED status
    if (![OfferStatus.NEGOTIATING, OfferStatus.REJECTED].includes(offer.status)) {
      return next(new AppError(`Cannot delete offer in ${offer.status} status`, 400));
    }
    
    await Offer.findByIdAndDelete(req.params.id);
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.OFFER_STATUS_CHANGED,
      description: `Offer ${offer._id} was deleted`,
      relatedModel: 'Offer',
      relatedId: offer._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}; 