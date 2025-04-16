import { Request, Response, NextFunction } from 'express';
import OfferTemplate from '../models/offerTemplateModel';
import { AppError } from '../middlewares/errorMiddleware';
import Activity, { ActivityType } from '../models/activityModel';
import { UserRole } from '../models/userModel';

// Get all templates for current user
export const getTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // If user is a supplier, only show their templates
    if (req.user.role === UserRole.SUPPLIER) {
      queryObj.supplier = req.user._id;
    }
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortBy = req.query.sort ? (req.query.sort as string).split(',').join(' ') : '-createdAt';
    
    // Find templates
    const templates = await OfferTemplate.find(queryObj)
      .populate('product', 'name code')
      .populate('supplier', 'name company')
      .skip(skip)
      .limit(limit)
      .sort(sortBy);
    
    // Count total
    const total = await OfferTemplate.countDocuments(queryObj);
    
    res.status(200).json({
      status: 'success',
      results: templates.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: {
        templates,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single template by ID
export const getTemplateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await OfferTemplate.findById(req.params.id)
      .populate('product', 'name code')
      .populate('supplier', 'name company');
    
    if (!template) {
      return next(new AppError('Template not found', 404));
    }
    
    // Check if the user has access to this template
    if (req.user.role === UserRole.SUPPLIER && template.supplier.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to view this template', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        template,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new template
export const createTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      product,
      price,
      quantity,
      unit,
      deliveryTerms,
      paymentTerms,
      notes,
      isDefault,
    } = req.body;
    
    // Create template
    const newTemplate = await OfferTemplate.create({
      name,
      description,
      supplier: req.user._id,
      product,
      price,
      quantity,
      unit,
      deliveryTerms,
      paymentTerms,
      notes,
      isDefault: isDefault || false,
    });
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.TEMPLATE_CREATED,
      description: `Template ${newTemplate.name} was created`,
      relatedModel: 'OfferTemplate',
      relatedId: newTemplate._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        template: newTemplate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a template
export const updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      product,
      price,
      quantity,
      unit,
      deliveryTerms,
      paymentTerms,
      notes,
      isDefault,
    } = req.body;
    
    // Find template
    const template = await OfferTemplate.findById(req.params.id);
    if (!template) {
      return next(new AppError('Template not found', 404));
    }
    
    // Check permissions
    if (req.user.role === UserRole.SUPPLIER && template.supplier.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to update this template', 403));
    }
    
    // Update template
    const updatedTemplate = await OfferTemplate.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        product,
        price,
        quantity,
        unit,
        deliveryTerms,
        paymentTerms,
        notes,
        isDefault,
      },
      { new: true, runValidators: true }
    );
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.TEMPLATE_UPDATED,
      description: `Template ${template.name} was updated`,
      relatedModel: 'OfferTemplate',
      relatedId: template._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        template: updatedTemplate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a template
export const deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await OfferTemplate.findById(req.params.id);
    
    if (!template) {
      return next(new AppError('Template not found', 404));
    }
    
    // Check permissions
    if (req.user.role === UserRole.SUPPLIER && template.supplier.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to delete this template', 403));
    }
    
    await OfferTemplate.findByIdAndDelete(req.params.id);
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.TEMPLATE_DELETED,
      description: `Template ${template.name} was deleted`,
      relatedModel: 'OfferTemplate',
      relatedId: template._id,
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

// Set template as default
export const setTemplateAsDefault = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find template
    const template = await OfferTemplate.findById(req.params.id);
    
    if (!template) {
      return next(new AppError('Template not found', 404));
    }
    
    // Check permissions
    if (req.user.role === UserRole.SUPPLIER && template.supplier.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to update this template', 403));
    }
    
    // Update template
    template.isDefault = true;
    await template.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.TEMPLATE_UPDATED,
      description: `Template ${template.name} was set as default`,
      relatedModel: 'OfferTemplate',
      relatedId: template._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        template,
      },
    });
  } catch (error) {
    next(error);
  }
}; 