import mongoose, { Schema, Document } from 'mongoose';

export interface IDesignTemplate extends Document {
  title: string;
  description?: string;
  category: string;
  width: number;
  height: number;
  thumbnailUrl?: string;
  documentData: Record<string, any>;
  isPublic: boolean;
  createdAt: Date;
}

const DesignTemplateSchema = new Schema<IDesignTemplate>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    width: {
      type: Number,
      required: true,
      min: 50,
      max: 8000,
    },
    height: {
      type: Number,
      required: true,
      min: 50,
      max: 8000,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    documentData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

DesignTemplateSchema.index({ category: 1, isPublic: 1 });

export const DesignTemplate: mongoose.Model<IDesignTemplate> =
  mongoose.models.DesignTemplate ||
  mongoose.model<IDesignTemplate>('DesignTemplate', DesignTemplateSchema);
