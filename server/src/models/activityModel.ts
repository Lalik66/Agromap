import mongoose, { Document, Schema } from 'mongoose';

export enum ActivityType {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_LOGIN = 'user_login',
  PRODUCT_CREATED = 'product_created',
  PRODUCT_UPDATED = 'product_updated',
  PRODUCT_DELETED = 'product_deleted',
  OFFER_CREATED = 'offer_created',
  OFFER_UPDATED = 'offer_updated',
  OFFER_STATUS_CHANGED = 'offer_status_changed',
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_STATUS_CHANGED = 'order_status_changed',
  COMMENT_ADDED = 'comment_added',
  COMMENT_UPDATED = 'comment_updated',
  COMMENT_DELETED = 'comment_deleted',
  TEMPLATE_CREATED = 'template_created',
  TEMPLATE_UPDATED = 'template_updated',
  TEMPLATE_DELETED = 'template_deleted',
  DOCUMENT_UPLOADED = 'document_uploaded',
  SYSTEM_EVENT = 'system_event'
}

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  type: ActivityType;
  description: string;
  relatedModel: string;
  relatedId: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

const activitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: [true, 'Activity type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    relatedModel: {
      type: String,
      required: [true, 'Related model is required'],
      enum: ['User', 'Product', 'Offer', 'Order', 'Comment', 'OfferTemplate', 'System'],
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Related ID is required'],
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    ip: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
activitySchema.index({ user: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ relatedModel: 1, relatedId: 1 });
activitySchema.index({ createdAt: -1 });

const Activity = mongoose.model<IActivity>('Activity', activitySchema);

export default Activity; 