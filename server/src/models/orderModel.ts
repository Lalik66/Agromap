import mongoose, { Document, Schema } from 'mongoose';

export enum OrderStatus {
  PRE_ORDER = 'pre_order',
  NEW = 'new',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ERROR = 'error'
}

export interface IOrder extends Document {
  orderNumber: string;
  supplier: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  offer: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    unit: string;
    subtotal: number;
  }[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  deliveryDetails: {
    address: string;
    city: string;
    country: string;
    postalCode?: string;
    contactPerson: string;
    contactPhone: string;
    estimatedDeliveryDate: Date;
    actualDeliveryDate?: Date;
    trackingNumber?: string;
    shippingMethod: string;
  };
  paymentDetails: {
    method: string;
    status: 'pending' | 'paid' | 'failed';
    transactionId?: string;
    paidAt?: Date;
    dueDate: Date;
  };
  documents: {
    type: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: mongoose.Types.ObjectId;
  }[];
  notes?: string;
  mixOrderId?: string;
  history: {
    status: string;
    updatedBy: mongoose.Types.ObjectId;
    updatedAt: Date;
    notes?: string;
  }[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offer: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PRE_ORDER,
    },
    deliveryDetails: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      postalCode: String,
      contactPerson: {
        type: String,
        required: true,
      },
      contactPhone: {
        type: String,
        required: true,
      },
      estimatedDeliveryDate: {
        type: Date,
        required: true,
      },
      actualDeliveryDate: Date,
      trackingNumber: String,
      shippingMethod: {
        type: String,
        required: true,
      },
    },
    paymentDetails: {
      method: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
      dueDate: {
        type: Date,
        required: true,
      },
    },
    documents: [
      {
        type: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    notes: String,
    mixOrderId: String,
    history: [
      {
        status: {
          type: String,
          required: true,
        },
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre<IOrder>('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await mongoose.model('Order').countDocuments();
    const sequence = (count + 1).toString().padStart(6, '0');
    this.orderNumber = `ORD-${year}${month}-${sequence}`;
  }
  next();
});

// Add record to history when status changes
orderSchema.pre<IOrder>('save', function (next) {
  if (this.isModified('status')) {
    this.history.push({
      status: this.status,
      updatedBy: this.updatedBy,
      updatedAt: new Date(),
    });
  }
  next();
});

// Calculate total amount before saving
orderSchema.pre<IOrder>('save', function (next) {
  if (this.isModified('items')) {
    this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);
  }
  next();
});

// Create indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ supplier: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ 'paymentDetails.status': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ mixOrderId: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order; 