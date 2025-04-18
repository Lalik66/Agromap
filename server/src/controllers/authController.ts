import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { UserRole, UserStatus } from '../models/userModel';
import { AppError } from '../middlewares/errorMiddleware';
import Activity, { ActivityType } from '../models/activityModel';

// Helper function to sign JWT token
const signToken = (id: string) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fallback_secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions
  );
};

// Helper function to create and send token
const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Register a new user (only for admins to create supplier accounts)
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, company, role, position, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Create user with default status (pending)
    const newUser = await User.create({
      name,
      email,
      password,
      company,
      role: role || UserRole.SUPPLIER,
      position,
      phone,
      createdBy: req.user ? req.user._id : undefined,
    });

    // Record activity
    await Activity.create({
      user: req.user ? req.user._id : newUser._id,
      type: ActivityType.USER_CREATED,
      description: `User ${newUser.name} was created`,
      relatedModel: 'User',
      relatedId: newUser._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// User login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Check if user is active
    if (user.status === UserStatus.BLOCKED) {
      return next(new AppError('Your account has been blocked. Please contact an administrator.', 403));
    }

    // Update last login time
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Record login activity
    await Activity.create({
      user: user._id,
      type: ActivityType.USER_LOGIN,
      description: `User ${user.name} logged in`,
      relatedModel: 'User',
      relatedId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id);

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

// Update current user profile
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Prevent updates to critical fields
    if (req.body.password || req.body.role || req.body.status) {
      return next(new AppError('This route is not for password, role or status updates', 400));
    }

    // Filter out unwanted fields
    const filteredBody = {
      name: req.body.name,
      position: req.body.position,
      phone: req.body.phone,
      language: req.body.language,
      notificationSettings: req.body.notificationSettings,
    };

    // Update user
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true,
    });

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.USER_UPDATED,
      description: 'User profile updated',
      relatedModel: 'User',
      relatedId: req.user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
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

// Change password
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user from collection
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if current password is correct
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Your current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.USER_UPDATED,
      description: 'User password updated',
      relatedModel: 'User',
      relatedId: req.user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Get user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('There is no user with that email address', 404));
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with the one in the database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Record activity
    await Activity.create({
      user: user._id,
      type: ActivityType.USER_UPDATED,
      description: 'Password reset completed',
      relatedModel: 'User',
      relatedId: user._id,
    });

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
}; 