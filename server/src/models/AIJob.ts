import mongoose, { Schema, Document, Types } from 'mongoose';

export type JobStatus = 'queued' | 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';

export interface IAIJob extends Document {
  userId?: Types.ObjectId;
  tool: string;
  status: JobStatus;
  inputMetadata: {
    originalName?: string;
    width?: number;
    height?: number;
    size?: number;
    mimeType?: string;
    mode?: string;
    prompt?: string;
    language?: string;
  };
  outputMetadata?: {
    width?: number;
    height?: number;
    size?: number;
    mimeType?: string;
    durationMs?: number;
    pageCount?: number;
    tokenCount?: number;
  };
  outputUrl?: string;
  outputText?: string;
  outputData?: Record<string, any>;
  creditsReserved?: number;
  creditsConsumed?: number;
  errorMessage?: string;
  idempotencyKey?: string;
  createdAt: Date;
  completedAt?: Date;
}

const AIJobSchema = new Schema<IAIJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    tool: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'pending', 'processing', 'completed', 'failed', 'canceled'],
      default: 'queued',
      index: true,
    },
    inputMetadata: {
      originalName: String,
      width: Number,
      height: Number,
      size: Number,
      mimeType: String,
      mode: String,
      prompt: String,
      language: String,
    },
    outputMetadata: {
      width: Number,
      height: Number,
      size: Number,
      mimeType: String,
      durationMs: Number,
      pageCount: Number,
      tokenCount: Number,
    },
    outputUrl: {
      type: String,
    },
    outputText: {
      type: String,
    },
    outputData: {
      type: Schema.Types.Mixed,
    },
    creditsReserved: {
      type: Number,
      default: 0,
    },
    creditsConsumed: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const AIJob: mongoose.Model<IAIJob> =
  (mongoose.models.AIJob as mongoose.Model<IAIJob>) || mongoose.model<IAIJob>('AIJob', AIJobSchema);
