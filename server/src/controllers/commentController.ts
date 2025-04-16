import { Request, Response, NextFunction } from 'express';
import Comment from '../models/commentModel';
import { AppError } from '../middlewares/errorMiddleware';
import Activity, { ActivityType } from '../models/activityModel';
import Notification, { NotificationType } from '../models/notificationModel';
import { UserRole } from '../models/userModel';

// Get comments for a specific item (offer, order, product)
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { relatedModel, relatedId } = req.query;
    
    if (!relatedModel || !relatedId) {
      return next(new AppError('Please provide relatedModel and relatedId', 400));
    }
    
    // Validate relatedModel
    if (!['Offer', 'Order', 'Product'].includes(relatedModel as string)) {
      return next(new AppError('Invalid relatedModel. Must be Offer, Order, or Product', 400));
    }
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    
    // Find comments
    const comments = await Comment.find({
      relatedModel,
      relatedId,
      isDeleted: false,
    })
      .populate('author', 'name avatar role company')
      .populate('parentComment')
      .skip(skip)
      .limit(limit)
      .sort('createdAt');
    
    // Count total
    const total = await Comment.countDocuments({
      relatedModel,
      relatedId,
      isDeleted: false,
    });
    
    res.status(200).json({
      status: 'success',
      results: comments.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: {
        comments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add a new comment
export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, relatedModel, relatedId, parentComment, attachments } = req.body;
    
    // Validate relatedModel
    if (!['Offer', 'Order', 'Product'].includes(relatedModel)) {
      return next(new AppError('Invalid relatedModel. Must be Offer, Order, or Product', 400));
    }
    
    // Validate that the related item exists
    const relatedModelClass = require(`../models/${relatedModel.toLowerCase()}Model`).default;
    const relatedItem = await relatedModelClass.findById(relatedId);
    
    if (!relatedItem) {
      return next(new AppError(`${relatedModel} not found`, 404));
    }
    
    // Validate parent comment if provided
    if (parentComment) {
      const parentCommentExists = await Comment.findById(parentComment);
      if (!parentCommentExists) {
        return next(new AppError('Parent comment not found', 404));
      }
    }
    
    // Create comment
    const newComment = await Comment.create({
      author: req.user._id,
      text,
      relatedModel,
      relatedId,
      parentComment,
      attachments,
    });
    
    // Populate author information for response
    await newComment.populate('author', 'name avatar role company');
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.COMMENT_ADDED,
      description: `Comment added to ${relatedModel} ${relatedId}`,
      relatedModel: 'Comment',
      relatedId: newComment._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Determine who to notify
    let notifyUserId;
    
    if (relatedModel === 'Offer') {
      // If current user is supplier, notify managers
      if (req.user.role === UserRole.SUPPLIER) {
        const managers = await require('../models/userModel').default.find({ role: UserRole.MANAGER });
        for (const manager of managers) {
          await Notification.create({
            user: manager._id,
            type: NotificationType.COMMENT_ADDED,
            title: 'New Comment on Offer',
            message: `${req.user.name} added a comment to an offer`,
            relatedModel,
            relatedId,
          });
        }
      } else {
        // If current user is manager/admin, notify supplier
        notifyUserId = relatedItem.supplier;
      }
    } else if (relatedModel === 'Order') {
      // Similar logic for orders
      if (req.user.role === UserRole.SUPPLIER) {
        notifyUserId = relatedItem.customer;
      } else {
        notifyUserId = relatedItem.supplier;
      }
    }
    
    // Create notification for the determined user
    if (notifyUserId && notifyUserId.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: notifyUserId,
        type: NotificationType.COMMENT_ADDED,
        title: `New Comment on ${relatedModel}`,
        message: `${req.user.name} added a comment to ${relatedModel.toLowerCase()} ${relatedItem.orderNumber || relatedItem._id}`,
        relatedModel,
        relatedId,
      });
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        comment: newComment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own comments', 403));
    }
    
    // Check if comment is deleted
    if (comment.isDeleted) {
      return next(new AppError('Cannot edit a deleted comment', 400));
    }
    
    // Update comment
    comment.text = text;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.COMMENT_UPDATED,
      description: `Comment ${comment._id} was updated`,
      relatedModel: 'Comment',
      relatedId: comment._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        comment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a comment (soft delete)
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    // Check if user has permission to delete
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;
    
    if (!isAuthor && !isAdmin) {
      return next(new AppError('You do not have permission to delete this comment', 403));
    }
    
    // Soft delete comment
    comment.isDeleted = true;
    comment.deletedBy = req.user._id;
    comment.deletedAt = new Date();
    await comment.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.COMMENT_DELETED,
      description: `Comment ${comment._id} was deleted`,
      relatedModel: 'Comment',
      relatedId: comment._id,
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