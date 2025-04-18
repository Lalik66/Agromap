import { Request, Response, NextFunction } from 'express';
import Product, { ProductStatus } from '../models/productModel';
import Category from '../models/categoryModel';
import { AppError } from '../middlewares/errorMiddleware';
import Activity, { ActivityType } from '../models/activityModel';

// Get all products with filters
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // For text search
    if (req.query.search) {
      queryObj.$text = { $search: req.query.search as string };
    }

    // For category filtering
    if (req.query.category) {
      const category = await Category.findById(req.query.category);
      if (category) {
        // If category has children (not a leaf), find all products in the category or its descendants
        if (!category.isLeaf) {
          const childCategories = await Category.find({
            path: { $regex: new RegExp(String(category._id)) }
          });
          const categoryIds = childCategories.map(cat => cat._id);
          queryObj.category = { $in: categoryIds } as any;
        }
      }
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sort ? (req.query.sort as string).split(',').join(' ') : '-createdAt';

    // Find products
    const products = await Product.find(JSON.parse(queryStr))
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .skip(skip)
      .limit(limit)
      .sort(sortBy);

    // Count total
    const total = await Product.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      status: 'success',
      results: products.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name path')
      .populate('subcategory', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new product (admin only)
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      code,
      description,
      category,
      subcategory,
      specifications,
      packagingOptions,
      supplyRegions,
      deliveryTerms,
      certifications,
      minOrderQuantity,
      images,
      status,
    } = req.body;

    // Check if product code exists
    const existingProduct = await Product.findOne({ code });
    if (existingProduct) {
      return next(new AppError('Product with this code already exists', 400));
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(new AppError('Category not found', 404));
    }

    // Verify subcategory if provided
    if (subcategory) {
      const subcategoryExists = await Category.findById(subcategory);
      if (!subcategoryExists) {
        return next(new AppError('Subcategory not found', 404));
      }
    }

    // Create product
    const newProduct = await Product.create({
      name,
      code,
      description,
      category,
      subcategory,
      specifications,
      packagingOptions,
      supplyRegions,
      deliveryTerms,
      certifications,
      minOrderQuantity,
      images,
      status: status || ProductStatus.DRAFT,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.PRODUCT_CREATED,
      description: `Product ${newProduct.name} was created`,
      relatedModel: 'Product',
      relatedId: newProduct._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a product (admin only)
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      specifications,
      packagingOptions,
      supplyRegions,
      deliveryTerms,
      certifications,
      minOrderQuantity,
      images,
      status,
    } = req.body;

    // Find product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Verify category exists if changed
    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return next(new AppError('Category not found', 404));
      }
    }

    // Verify subcategory if provided and changed
    if (subcategory && subcategory !== product.subcategory?.toString()) {
      const subcategoryExists = await Category.findById(subcategory);
      if (!subcategoryExists) {
        return next(new AppError('Subcategory not found', 404));
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        subcategory,
        specifications,
        packagingOptions,
        supplyRegions,
        deliveryTerms,
        certifications,
        minOrderQuantity,
        images,
        status,
        updatedBy: req.user._id,
      },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.PRODUCT_UPDATED,
      description: `Product ${product.name} was updated`,
      relatedModel: 'Product',
      relatedId: product._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      status: 'success',
      data: {
        product: updatedProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update product status
export const updateProductStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!Object.values(ProductStatus).includes(status as ProductStatus)) {
      return next(new AppError('Invalid status', 400));
    }

    // Find product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Update status
    product.status = status as ProductStatus;
    product.updatedBy = req.user._id;
    await product.save();

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.PRODUCT_UPDATED,
      description: `Product ${product.name} status changed to ${status}`,
      relatedModel: 'Product',
      relatedId: product._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product (admin only)
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    await Product.findByIdAndDelete(req.params.id);

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.PRODUCT_DELETED,
      description: `Product ${product.name} was deleted`,
      relatedModel: 'Product',
      relatedId: product._id,
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