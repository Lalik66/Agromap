import mongoose, { Document, Schema } from 'mongoose';

export interface IOfferTemplate extends Document {
  name: string;
  description?: string;
  supplier: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  price?: {
    value: number;
    currency: string;
  };
  quantity?: number;
  unit?: string;
  deliveryTerms?: {
    region?: string;
    estimatedDays?: number;
    shippingMethod?: string;
    incoterm?: string;
  };
  paymentTerms?: {
    method?: string;
    daysToPayment?: number;
  };
  notes?: string;
  isDefault: boolean;
}

const offerTemplateSchema = new Schema<IOfferTemplate>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supplier is required'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    price: {
      value: {
        type: Number,
      },
      currency: {
        type: String,
        enum: ['USD', 'EUR', 'AZN', 'RUB'],
      },
    },
    quantity: {
      type: Number,
    },
    unit: {
      type: String,
      enum: ['kg', 'ton', 'piece', 'box', 'pallet'],
    },
    deliveryTerms: {
      region: {
        type: String,
      },
      estimatedDays: {
        type: Number,
      },
      shippingMethod: {
        type: String,
      },
      incoterm: {
        type: String,
        enum: ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FOB', 'CFR', 'CIF'],
      },
    },
    paymentTerms: {
      method: {
        type: String,
        enum: ['bank_transfer', 'letter_of_credit', 'cash', 'other'],
      },
      daysToPayment: {
        type: Number,
      },
    },
    notes: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default template per supplier
offerTemplateSchema.pre<IOfferTemplate>('save', async function (next) {
  if (this.isDefault && (this.isNew || this.isModified('isDefault'))) {
    try {
      await mongoose.model('OfferTemplate').updateMany(
        { supplier: this.supplier, _id: { $ne: this._id }, isDefault: true },
        { isDefault: false }
      );
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Create indexes for better performance
offerTemplateSchema.index({ supplier: 1 });
offerTemplateSchema.index({ isDefault: 1 });
offerTemplateSchema.index({ product: 1 });

const OfferTemplate = mongoose.model<IOfferTemplate>('OfferTemplate', offerTemplateSchema);

export default OfferTemplate;

 