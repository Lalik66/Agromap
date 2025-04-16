import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// User roles enum
export enum UserRole {
  SUPPLIER = 'supplier',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

// User status enum
export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  PENDING = 'pending'
}

// Interface for the user document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  company: string;
  position?: string;
  phone?: string;
  language: string;
  avatar?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerified: boolean;
  passwordChangedAt?: Date;
  lastLogin?: Date;
  createdBy?: mongoose.Types.ObjectId;
  notificationSettings: {
    email: boolean;
    system: boolean;
  };
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  passwordChangedAfter(timestamp: number): boolean;
  createPasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false, // Don't return password in queries
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.SUPPLIER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    company: {
      type: String,
      required: [true, 'Please provide your company name'],
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      enum: ['en', 'ru', 'az'],
      default: 'ru',
    },
    avatar: {
      type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerificationToken: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    lastLogin: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notificationSettings: {
      email: {
        type: Boolean,
        default: true,
      },
      system: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  // Only run this function if password was modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Update passwordChangedAt property
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000); // Subtract 1 second to ensure token is created after password change
  }

  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was changed after token was issued
userSchema.methods.passwordChangedAfter = function (JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Method to create password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // Token expires in 10 minutes

  return resetToken;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User; 