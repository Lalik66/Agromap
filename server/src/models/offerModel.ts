import mongoose, { Document, Schema } from 'mongoose';

export enum OfferStatus {
  NEGOTIATING = 'negotiating',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface IOffer extends Document {
  product: mongoose.Types.ObjectId;
  supplier: mongoose.Types.ObjectId;
  price: {
    value: number;
    currency: string;
  };
  quantity: number;
  unit: string;
  expiresAt: Date;
  status: OfferStatus;
  deliveryTerms: {
    region: string;
    estimatedDays: number;
    shippingMethod: string;
    incoterm: string;
  };
  paymentTerms: {
    method: string;
    daysToPayment: number;
  };
  notes?: string;
  mixOrderId?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  history: {
    status: string;
    updatedBy: mongoose.Types.ObjectId;
    updatedAt: Date;
    notes?: string;
  }[];
}

const offerSchema = new Schema<IOffer>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supplier is required'],
    },
    price: {
      value: {
        type: Number,
        required: [true, 'Price value is required'],
      },
      currency: {
        type: String,
        required: [true, 'Currency is required'],
        enum: ['USD', 'EUR', 'AZN', 'RUB'],
      },
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'ton', 'piece', 'box', 'pallet'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    status: {
      type: String,
      enum: Object.values(OfferStatus),
      default: OfferStatus.NEGOTIATING,
    },
    deliveryTerms: {
      region: {
        type: String,
        required: [true, 'Delivery region is required'],
      },
      estimatedDays: {
        type: Number,
        required: [true, 'Estimated delivery days are required'],
      },
      shippingMethod: {
        type: String,
        required: [true, 'Shipping method is required'],
      },
      incoterm: {
        type: String,
        required: [true, 'Incoterm is required'],
        enum: ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FOB', 'CFR', 'CIF'],
      },
    },
    paymentTerms: {
      method: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['bank_transfer', 'letter_of_credit', 'cash', 'other'],
      },
      daysToPayment: {
        type: Number,
        required: [true, 'Days to payment are required'],
      },
    },
    notes: {
      type: String,
    },
    mixOrderId: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
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
        notes: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Set expiration to 7 days from creation by default
offerSchema.pre<IOffer>('save', function (next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Add record to history when status changes
offerSchema.pre<IOffer>('save', function (next) {
  if (this.isModified('status')) {
    this.history.push({
      status: this.status,
      updatedBy: this.reviewedBy || this.supplier,
      updatedAt: new Date(),
      notes: this.rejectionReason,
    });

    if (this.status === OfferStatus.APPROVED || this.status === OfferStatus.REJECTED) {
      this.reviewedAt = new Date();
    }
  }
  next();
});

// Create indexes for better performance
offerSchema.index({ supplier: 1 });
offerSchema.index({ product: 1 });
offerSchema.index({ status: 1 });
offerSchema.index({ expiresAt: 1 });
offerSchema.index({ mixOrderId: 1 });

const Offer = mongoose.model<IOffer>('Offer', offerSchema);

export default Offer; 