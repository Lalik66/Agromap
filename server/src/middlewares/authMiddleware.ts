import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorMiddleware';
import User from '../models/userModel';

// Extend Express Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Check if token exists
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access', 401));
    }

    // 2) Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (user.passwordChangedAfter && user.passwordChangedAfter(decoded.iat)) {
      return next(new AppError('User recently changed password. Please log in again', 401));
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Authentication failed', 401));
  }
};

// Middleware to restrict access to specific roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
}; 