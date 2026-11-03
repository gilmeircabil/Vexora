import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDesignVersion extends Document {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  versionNumber: number;
  versionName: string;
  documentData: Record<string, any>;
  thumbnailUrl?: string;
  createdAt: Date;
}

const DesignVersionSchema = new Schema<IDesignVersion>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'DesignProject',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    versionName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    documentData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
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

DesignVersionSchema.index({ projectId: 1, versionNumber: -1 });
DesignVersionSchema.index({ projectId: 1, createdAt: -1 });

export const DesignVersion: mongoose.Model<IDesignVersion> =
  mongoose.models.DesignVersion ||
  mongoose.model<IDesignVersion>('DesignVersion', DesignVersionSchema);
