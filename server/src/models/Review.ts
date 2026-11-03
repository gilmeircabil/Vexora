import mongoose, { Schema, type Document } from 'mongoose';

export type ReviewStatus = 'approved' | 'hidden' | 'pending';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    userAvatar: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    status: {
      type: String,
      enum: ['approved', 'hidden', 'pending'],
      default: 'approved',
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for fast public approved review feed & rating aggregations
ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ status: 1, rating: -1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
