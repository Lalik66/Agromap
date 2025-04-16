import { Request, Response, NextFunction } from 'express';
import Notification from '../models/notificationModel';
import { AppError } from '../middlewares/errorMiddleware';

// Get all notifications for the current user
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryObj: any = { user: req.user._id };
    
    // Filter by read status
    if (req.query.isRead === 'true') {
      queryObj.isRead = true;
    } else if (req.query.isRead === 'false') {
      queryObj.isRead = false;
    }
    
    // Filter by type
    if (req.query.type) {
      queryObj.type = req.query.type;
    }
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Only return notifications that haven't expired
    queryObj.expiresAt = { $gt: new Date() };
    
    // Find notifications
    const notifications = await Notification.find(queryObj)
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');
    
    // Count total
    const total = await Notification.countDocuments(queryObj);
    
    // Count unread
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
      expiresAt: { $gt: new Date() },
    });
    
    res.status(200).json({
      status: 'success',
      results: notifications.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount,
      data: {
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }
    
    // Check if the notification belongs to the current user
    if (notification.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to access this notification', 403));
    }
    
    // Update notification
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        notification,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }
    
    // Check if the notification belongs to the current user
    if (notification.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to delete this notification', 403));
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}; 