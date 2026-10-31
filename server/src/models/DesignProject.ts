import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDesignProject extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  width: number;
  height: number;
  background: string;
  category: string;
  documentData: Record<string, any>;
  thumbnailUrl?: string;
  currentVersion: number;
  revision: number;
  isStarred: boolean;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DesignProjectSchema = new Schema<IDesignProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Untitled Design',
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    width: {
      type: Number,
      required: true,
      min: 50,
      max: 8000,
      default: 1080,
    },
    height: {
      type: Number,
      required: true,
      min: 50,
      max: 8000,
      default: 1080,
    },
    background: {
      type: String,
      default: '#ffffff',
    },
    category: {
      type: String,
      default: 'custom',
      index: true,
    },
    documentData: {
      type: Schema.Types.Mixed,
      required: true,
      default: () => ({
        version: '7.4.0',
        objects: [],
      }),
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    currentVersion: {
      type: Number,
      default: 1,
      min: 1,
    },
    revision: {
      type: Number,
      default: 1,
      min: 1,
    },
    isStarred: {
      type: Boolean,
      default: false,
      index: true,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

DesignProjectSchema.index({ userId: 1, updatedAt: -1 });
DesignProjectSchema.index({ userId: 1, isStarred: 1 });
DesignProjectSchema.index({ userId: 1, category: 1 });

export const DesignProject: mongoose.Model<IDesignProject> =
  mongoose.models.DesignProject || mongoose.model<IDesignProject>('DesignProject', DesignProjectSchema);
