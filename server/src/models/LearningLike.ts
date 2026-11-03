import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILearningLike extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  createdAt: Date;
}

const LearningLikeSchema = new Schema<ILearningLike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningPost',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Prevent duplicate likes from the same user on the same post
LearningLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const LearningLike: mongoose.Model<ILearningLike> =
  (mongoose.models.LearningLike as mongoose.Model<ILearningLike>) ||
  mongoose.model<ILearningLike>('LearningLike', LearningLikeSchema);
