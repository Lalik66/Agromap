import { Request, Response, NextFunction } from 'express';
import User, { UserRole, UserStatus } from '../models/userModel';
import { AppError } from '../middlewares/errorMiddleware';
import Activity, { ActivityType } from '../models/activityModel';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = { ...req.query };
    
    // Exclude pagination fields from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete query[field]);
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortBy = req.query.sort ? (req.query.sort as string) : '-createdAt';
    
    // Find users
    const users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortBy);
    
    // Count total
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new user (admin only)
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, company, role, position, phone, status } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      company,
      role: role || UserRole.SUPPLIER,
      position,
      phone,
      status: status || UserStatus.PENDING,
      createdBy: req.user._id,
    });
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.USER_CREATED,
      description: `User ${newUser.name} was created by admin`,
      relatedModel: 'User',
      relatedId: newUser._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Remove password from output
    newUser.password = undefined;
    
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin only)
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, company, role, position, phone, status, language } = req.body;
    
    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, company, role, position, phone, status, language },
      { new: true, runValidators: true }
    );
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.USER_UPDATED,
      description: `User ${user.name} was updated by admin`,
      relatedModel: 'User',
      relatedId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        changes: {
          before: {
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
          after: {
            name: updatedUser?.name,
            email: updatedUser?.email,
            role: updatedUser?.role,
            status: updatedUser?.status,
          },
        },
      },
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Change user status (block/unblock)
export const changeUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!Object.values(UserStatus).includes(status as UserStatus)) {
      return next(new AppError('Invalid status', 400));
    }
    
    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Prevent changing admin status
    if (user.role === UserRole.ADMIN && req.user._id.toString() !== user._id.toString()) {
      return next(new AppError('You cannot change the status of another admin user', 403));
    }
    
    // Update status
    user.status = status as UserStatus;
    await user.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.USER_UPDATED,
      description: `User ${user.name} status changed to ${status}`,
      relatedModel: 'User',
      relatedId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reset user password (admin only)
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return next(new AppError('Please provide a password', 400));
    }
    
    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Update password
    user.password = password;
    await user.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.USER_UPDATED,
      description: `User ${user.name} password was reset by admin`,
      relatedModel: 'User',
      relatedId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Prevent deleting admin users
    if (user.role === UserRole.ADMIN) {
      return next(new AppError('Cannot delete admin user', 403));
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.USER_DELETED,
      description: `User ${user.name} was deleted by admin`,
      relatedModel: 'User',
      relatedId: user._id,
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