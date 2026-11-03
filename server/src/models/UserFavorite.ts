import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserFavorite extends Document {
  userId: Types.ObjectId;
  toolId: string;
  createdAt: Date;
}

const UserFavoriteSchema = new Schema<IUserFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toolId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

// Compound unique index to prevent duplicate favorites per user
UserFavoriteSchema.index({ userId: 1, toolId: 1 }, { unique: true });

// Index for ordering favorites by recent addition
UserFavoriteSchema.index({ userId: 1, createdAt: -1 });

export const UserFavorite: mongoose.Model<IUserFavorite> =
  mongoose.models.UserFavorite || mongoose.model<IUserFavorite>('UserFavorite', UserFavoriteSchema);
