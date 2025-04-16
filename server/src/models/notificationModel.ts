import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  OFFER_STATUS_CHANGE = 'offer_status_change',
  ORDER_STATUS_CHANGE = 'order_status_change',
  COMMENT_ADDED = 'comment_added',
  ACCOUNT_UPDATE = 'account_update',
  SYSTEM_MESSAGE = 'system_message',
  OTHER = 'other'
}

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedModel?: string;
  relatedId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedModel: {
      type: String,
      enum: ['Offer', 'Order', 'User', 'Product', null],
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Set expiration date if not provided (30 days by default)
notificationSchema.pre<INotification>('save', function (next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Create indexes for better performance
notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ relatedModel: 1, relatedId: 1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification; 