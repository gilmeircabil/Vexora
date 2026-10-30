import mongoose, { Schema, Document } from 'mongoose';
import type { PlanTier } from '../config/plans.js';

export interface IAIToolConfig extends Document {
  toolId: string;
  name: string;
  creditCost: number;
  minPlan: PlanTier;
  isEnabled: boolean;
  description?: string;
  updatedAt: Date;
}

const AIToolConfigSchema = new Schema<IAIToolConfig>(
  {
    toolId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    creditCost: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    minPlan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const AIToolConfig: mongoose.Model<IAIToolConfig> =
  (mongoose.models.AIToolConfig as mongoose.Model<IAIToolConfig>) ||
  mongoose.model<IAIToolConfig>('AIToolConfig', AIToolConfigSchema);
