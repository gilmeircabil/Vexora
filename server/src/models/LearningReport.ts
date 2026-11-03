import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type LearningReportTargetType = 'post' | 'comment' | 'review' | 'creator';
export type LearningReportCategory =
  'spam' | 'inappropriate' | 'copyright' | 'prohibited' | 'other';

export interface ILearningReport extends Document {
  reporterUserId: Types.ObjectId;
  targetType: LearningReportTargetType;
  targetId: Types.ObjectId;
  category: LearningReportCategory;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  actionTaken?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const learningReportSchema = new Schema<ILearningReport>(
  {
    reporterUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'comment', 'review', 'creator'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['spam', 'inappropriate', 'copyright', 'prohibited', 'other'],
      default: 'other',
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    actionTaken: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

learningReportSchema.index({ status: 1, createdAt: -1 });

export const LearningReport = mongoose.model<ILearningReport>(
  'LearningReport',
  learningReportSchema,
);
