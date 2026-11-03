import mongoose, { Schema, Document, Types } from 'mongoose';

export type LearningCommentStatus = 'active' | 'hidden' | 'deleted';

export interface ILearningComment extends Document {
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  authorName: string;
  authorAvatar?: string;
  parentCommentId?: Types.ObjectId | null;
  content: string;
  status: LearningCommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LearningCommentSchema = new Schema<ILearningComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningPost',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    authorAvatar: {
      type: String,
      default: '',
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningComment',
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'deleted'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

LearningCommentSchema.index({ postId: 1, status: 1, createdAt: 1 });

export const LearningComment: mongoose.Model<ILearningComment> =
  (mongoose.models.LearningComment as mongoose.Model<ILearningComment>) ||
  mongoose.model<ILearningComment>('LearningComment', LearningCommentSchema);
