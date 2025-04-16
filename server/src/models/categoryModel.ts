import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  parent?: mongoose.Types.ObjectId;
  level: number;
  path: string;
  icon?: string;
  status: 'active' | 'inactive';
  isLeaf: boolean;
  specifications?: {
    name: string;
    type: string; // 'string', 'number', 'boolean', 'date', etc.
    required: boolean;
    options?: string[];
    unit?: string;
  }[];
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    level: {
      type: Number,
      default: 1,
    },
    path: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isLeaf: {
      type: Boolean,
      default: false,
    },
    specifications: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ['string', 'number', 'boolean', 'date', 'enum'],
        },
        required: {
          type: Boolean,
          default: false,
        },
        options: [String],
        unit: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate path and level
categorySchema.pre<ICategory>('save', async function (next) {
  if (this.isNew || this.isModified('parent')) {
    if (!this.parent) {
      this.level = 1;
      this.path = this._id.toString();
    } else {
      try {
        const parentCategory = await mongoose.model('Category').findById(this.parent);
        if (!parentCategory) {
          return next(new Error('Parent category not found'));
        }

        this.level = parentCategory.level + 1;
        this.path = `${parentCategory.path},${this._id.toString()}`;

        // Update parent's isLeaf status
        await mongoose.model('Category').findByIdAndUpdate(this.parent, {
          isLeaf: false,
        });
      } catch (error) {
        return next(error as Error);
      }
    }
  }
  next();
});

// Create indexes for better performance
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ name: 'text' });

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category; 