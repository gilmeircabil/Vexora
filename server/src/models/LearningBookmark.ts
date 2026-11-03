import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILearningBookmark extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  createdAt: Date;
}

const LearningBookmarkSchema = new Schema<ILearningBookmark>(
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

LearningBookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const LearningBookmark: mongoose.Model<ILearningBookmark> =
  (mongoose.models.LearningBookmark as mongoose.Model<ILearningBookmark>) ||
  mongoose.model<ILearningBookmark>('LearningBookmark', LearningBookmarkSchema);
