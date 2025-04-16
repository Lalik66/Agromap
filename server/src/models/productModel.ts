import mongoose, { Document, Schema } from 'mongoose';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}

export interface IProduct extends Document {
  name: string;
  code: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  images: string[];
  status: ProductStatus;
  specifications: {
    [key: string]: any;
  };
  packagingOptions: {
    type: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  }[];
  supplyRegions: string[];
  deliveryTerms: string[];
  certifications: string[];
  minOrderQuantity?: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    images: [String],
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.DRAFT,
    },
    specifications: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    packagingOptions: [
      {
        type: {
          type: String,
          required: true,
        },
        weight: {
          type: Number,
          required: true,
        },
        dimensions: {
          length: {
            type: Number,
            required: true,
          },
          width: {
            type: Number,
            required: true,
          },
          height: {
            type: Number,
            required: true,
          },
        },
      },
    ],
    supplyRegions: [String],
    deliveryTerms: [String],
    certifications: [String],
    minOrderQuantity: Number,
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

// Create indexes for better performance
productSchema.index({ name: 'text', code: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdBy: 1 });

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product; 