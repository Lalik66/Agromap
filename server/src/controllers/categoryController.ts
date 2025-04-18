import { Request, Response, NextFunction } from 'express';
import Category from '../models/categoryModel';
import { AppError } from '../middlewares/errorMiddleware';
import Activity, { ActivityType } from '../models/activityModel';

// Get all categories with optional filtering and hierarchy
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'hierarchy'];
    excludedFields.forEach(field => delete queryObj[field]);

    // For text search
    if (req.query.search) {
      queryObj.$text = { $search: req.query.search as string };
    }

    // For parent filter (get only direct children of a category)
    if (req.query.parent === 'null' || req.query.parent === '') {
      queryObj.parent = null as unknown as string;
    } else if (req.query.parent) {
      queryObj.parent = req.query.parent;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000; // Higher limit for categories
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sort ? (req.query.sort as string).split(',').join(' ') : 'level,name';

    // Find categories
    const categories = await Category.find(queryObj)
      .populate('parent', 'name')
      .skip(skip)
      .limit(limit)
      .sort(sortBy);

    // Count total
    const total = await Category.countDocuments(queryObj);

    // If hierarchy requested, build tree structure
    if (req.query.hierarchy === 'true') {
      // Get all categories to build tree
      const allCategories = await Category.find().sort('path');
      
      // Create a map of categories by id
      const categoriesMap = new Map();
      allCategories.forEach(category => {
        categoriesMap.set(category._id.toString(), {
          ...category.toObject(),
          children: []
        });
      });
      
      // Build the tree structure
      const rootCategories: any[] = [];
      allCategories.forEach(category => {
        const categoryWithChildren = categoriesMap.get(category._id.toString());
        
        if (category.parent) {
          // Add to parent's children array
          const parentCategory = categoriesMap.get(category.parent.toString());
          if (parentCategory) {
            parentCategory.children.push(categoryWithChildren);
          }
        } else {
          // Root category
          rootCategories.push(categoryWithChildren);
        }
      });
      
      return res.status(200).json({
        status: 'success',
        results: rootCategories.length,
        total: allCategories.length,
        data: {
          categories: rootCategories,
        },
      });
    }

    // Return flat list
    res.status(200).json({
      status: 'success',
      results: categories.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single category by ID
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name');

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new category (admin only)
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, parent, icon, status, specifications } = req.body;

    // Verify parent category if provided
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return next(new AppError('Parent category not found', 404));
      }
    }

    // Create category
    const newCategory = await Category.create({
      name,
      description,
      parent,
      icon,
      status: status || 'active',
      specifications,
      isLeaf: req.body.isLeaf || false,
    });

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.PRODUCT_CREATED,
      description: `Category ${newCategory.name} was created`,
      relatedModel: 'Category',
      relatedId: newCategory._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      status: 'success',
      data: {
        category: newCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a category (admin only)
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, parent, icon, status, specifications, isLeaf } = req.body;

    // Find category
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Prevent making a parent category a child of its own descendants
    if (parent && category.path.includes(parent)) {
      return next(new AppError('A category cannot be a child of its own descendant', 400));
    }

    // Verify parent category if changed
    if (parent && parent !== category.parent?.toString()) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return next(new AppError('Parent category not found', 404));
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        parent,
        icon,
        status,
        specifications,
        isLeaf,
      },
      { new: true, runValidators: true }
    );

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.PRODUCT_UPDATED,
      description: `Category ${category.name} was updated`,
      relatedModel: 'Category',
      relatedId: category._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      status: 'success',
      data: {
        category: updatedCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a category (admin only)
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Check if category has children
    const hasChildren = await Category.exists({ parent: req.params.id });
    if (hasChildren) {
      return next(new AppError('Cannot delete a category with subcategories. Delete subcategories first.', 400));
    }

    // Check if category is used in products
    const Product = require('../models/productModel').default;
    const isUsedInProducts = await Product.exists({ 
      $or: [
        { category: req.params.id },
        { subcategory: req.params.id }
      ]
    });

    if (isUsedInProducts) {
      return next(new AppError('Cannot delete a category that is used by products', 400));
    }

    await Category.findByIdAndDelete(req.params.id);

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.PRODUCT_DELETED,
      description: `Category ${category.name} was deleted`,
      relatedModel: 'Category',
      relatedId: category._id,
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