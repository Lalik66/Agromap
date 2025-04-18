import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  author: mongoose.Types.ObjectId;
  text: string;
  relatedModel: string;
  relatedId: mongoose.Types.ObjectId;
  attachments?: string[];
  parentComment?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
    relatedModel: {
      type: String,
      required: [true, 'Related model is required'],
      enum: ['Offer', 'Order', 'Product'],
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Related ID is required'],
    },
    attachments: [String],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedAt: Date,
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
  },
  {
    timestamps: true,
  }
);

// When updating a comment, mark it as edited
commentSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();
  
  if (update && update.text) {
    this.setUpdate({
      ...update,
      isEdited: true,
      editedAt: new Date(),
    });
  }
  
  next();
});

// Create indexes for better performance
commentSchema.index({ author: 1 });
commentSchema.index({ relatedModel: 1, relatedId: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createdAt: -1 });

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment; 