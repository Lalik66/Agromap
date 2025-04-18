import { Request, Response, NextFunction } from 'express';
import Order, { OrderStatus } from '../models/orderModel';
import Offer, { OfferStatus } from '../models/offerModel';
import { AppError } from '../middlewares/errorMiddleware';
import Activity, { ActivityType } from '../models/activityModel';
import { UserRole } from '../models/userModel';
import Notification, { NotificationType } from '../models/notificationModel';

// Get all orders with filters
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // If user is a supplier, only show their orders
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
    
    // Find orders
    const orders = await Order.find(JSON.parse(queryStr))
      .populate('supplier', 'name company')
      .populate('customer', 'name')
      .populate('offer', 'product price')
      .populate({
        path: 'items.product',
        select: 'name code images',
      })
      .skip(skip)
      .limit(limit)
      .sort(sortBy);
    
    // Count total
    const total = await Order.countDocuments(JSON.parse(queryStr));
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: {
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single order by ID
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('supplier', 'name company email phone')
      .populate('customer', 'name')
      .populate('offer')
      .populate({
        path: 'items.product',
        select: 'name code description images specifications category',
      })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Check if the user has access to this order
    if (req.user.role === UserRole.SUPPLIER && order.supplier.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to view this order', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new order from an approved offer (admin/manager only)
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      offerId,
      deliveryDetails,
      paymentDetails,
    } = req.body;
    
    // Check if offer exists and is approved
    const offer = await Offer.findById(offerId)
      .populate('product', 'name code');
    
    if (!offer) {
      return next(new AppError('Offer not found', 404));
    }
    
    if (offer.status !== OfferStatus.APPROVED) {
      return next(new AppError('Cannot create order from an offer that is not approved', 400));
    }
    
    // Create order
    const newOrder = await Order.create({
      supplier: offer.supplier,
      customer: req.user._id,
      offer: offer._id,
      items: [{
        product: offer.product,
        quantity: offer.quantity,
        price: offer.price.value,
        unit: offer.unit,
        subtotal: offer.price.value * offer.quantity,
      }],
      totalAmount: offer.price.value * offer.quantity,
      currency: offer.price.currency,
      status: OrderStatus.NEW,
      deliveryDetails,
      paymentDetails,
      mixOrderId: offer.mixOrderId,
      history: [
        {
          status: OrderStatus.NEW,
          updatedBy: req.user._id,
          updatedAt: new Date(),
          notes: 'Order created',
        },
      ],
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.ORDER_CREATED,
      description: `Order ${newOrder.orderNumber} was created from offer`,
      relatedModel: 'Order',
      relatedId: newOrder._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Notify supplier
    await Notification.create({
      user: offer.supplier,
      type: NotificationType.ORDER_STATUS_CHANGE,
      title: 'New Order Created',
      message: `A new order (${newOrder.orderNumber}) has been created from your approved offer`,
      relatedModel: 'Order',
      relatedId: newOrder._id,
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, notes } = req.body;
    
    // Validate status
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      return next(new AppError('Invalid status', 400));
    }
    
    // Find order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Check permissions
    if (req.user.role === UserRole.SUPPLIER) {
      // Suppliers can only change their own orders to specific statuses
      if (order.supplier.toString() !== req.user._id.toString()) {
        return next(new AppError('You do not have permission to update this order', 403));
      }
      
      // Suppliers can only confirm, ship, or report errors
      const allowedStatusChanges: Record<string, OrderStatus[]> = {
        [OrderStatus.NEW]: [OrderStatus.CONFIRMED, OrderStatus.ERROR],
        [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.ERROR],
        [OrderStatus.IN_PROGRESS]: [OrderStatus.SHIPPED, OrderStatus.ERROR],
      };
      
      if (!allowedStatusChanges[order.status]?.includes(status as OrderStatus)) {
        return next(new AppError(`Cannot change order status from ${order.status} to ${status}`, 400));
      }
    }
    
    // Update status and record history
    order.status = status as OrderStatus;
    order.updatedBy = req.user._id;
    
    order.history.push({
      status,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      notes,
    });
    
    // Special status handling
    if (status === OrderStatus.SHIPPED) {
      order.deliveryDetails.actualDeliveryDate = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      // If payment is cash on delivery, mark as paid
      if (order.paymentDetails.method === 'cash' && order.paymentDetails.status === 'pending') {
        order.paymentDetails.status = 'paid';
        order.paymentDetails.paidAt = new Date();
      }
    }
    
    await order.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.ORDER_STATUS_CHANGED,
      description: `Order ${order.orderNumber} status changed to ${status}`,
      relatedModel: 'Order',
      relatedId: order._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Notify relevant parties
    const notifyUser = req.user.role === UserRole.SUPPLIER ? order.customer : order.supplier;
    await Notification.create({
      user: notifyUser,
      type: NotificationType.ORDER_STATUS_CHANGE,
      title: `Order ${status.replace('_', ' ')}`,
      message: `Order ${order.orderNumber} has been ${status.replace('_', ' ')}${notes ? `. Notes: ${notes}` : ''}`,
      relatedModel: 'Order',
      relatedId: order._id,
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update order (admin/manager only)
export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      deliveryDetails,
      paymentDetails,
      notes,
    } = req.body;
    
    // Find order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Only allow updates to NEW or CONFIRMED orders
    if (![OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.IN_PROGRESS].includes(order.status)) {
      return next(new AppError(`Cannot update order in ${order.status} status`, 400));
    }
    
    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        deliveryDetails,
        paymentDetails,
        notes,
        updatedBy: req.user._id,
      },
      { new: true, runValidators: true }
    );
    
    // Add record to history
    order.history.push({
      status: order.status,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      notes: 'Order details updated',
    });
    await order.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.ORDER_UPDATED,
      description: `Order ${order.orderNumber} was updated`,
      relatedModel: 'Order',
      relatedId: order._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Notify supplier
    await Notification.create({
      user: order.supplier,
      type: NotificationType.ORDER_STATUS_CHANGE,
      title: 'Order Updated',
      message: `Order ${order.orderNumber} details have been updated`,
      relatedModel: 'Order',
      relatedId: order._id,
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cancel an order (admin/manager only)
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cancelReason } = req.body;
    
    // Find order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Only allow cancellation of orders in specific statuses
    if (![OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.ERROR].includes(order.status)) {
      return next(new AppError(`Cannot cancel order in ${order.status} status`, 400));
    }
    
    // Update status
    order.status = OrderStatus.CANCELLED;
    order.updatedBy = req.user._id;
    
    order.history.push({
      status: OrderStatus.CANCELLED,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      notes: cancelReason || 'Order cancelled',
    });
    
    await order.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.ORDER_STATUS_CHANGED,
      description: `Order ${order.orderNumber} was cancelled`,
      relatedModel: 'Order',
      relatedId: order._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Notify supplier
    await Notification.create({
      user: order.supplier,
      type: NotificationType.ORDER_STATUS_CHANGE,
      title: 'Order Cancelled',
      message: `Order ${order.orderNumber} has been cancelled${cancelReason ? `. Reason: ${cancelReason}` : ''}`,
      relatedModel: 'Order',
      relatedId: order._id,
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add document to order
export const addOrderDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, url } = req.body;
    
    // Find order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Check permissions
    if (req.user.role === UserRole.SUPPLIER && order.supplier.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to update this order', 403));
    }
    
    // Add document
    order.documents.push({
      type,
      url,
      uploadedAt: new Date(),
      uploadedBy: req.user._id,
    });
    
    await order.save();
    
    // Record activity
    await Activity.create({
      user: req.user._id,
      type: ActivityType.DOCUMENT_UPLOADED,
      description: `Document (${type}) was added to Order ${order.orderNumber}`,
      relatedModel: 'Order',
      relatedId: order._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
}; 