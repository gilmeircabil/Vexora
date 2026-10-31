import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDesignAsset extends Document {
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  createdAt: Date;
}

const DesignAssetSchema = new Schema<IDesignAsset>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'DesignProject',
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

DesignAssetSchema.index({ userId: 1, createdAt: -1 });

export const DesignAsset: mongoose.Model<IDesignAsset> =
  mongoose.models.DesignAsset || mongoose.model<IDesignAsset>('DesignAsset', DesignAssetSchema);
