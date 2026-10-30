import mongoose, { Schema, Document } from 'mongoose';

export type WebhookProcessingStatus = 'received' | 'processed' | 'failed' | 'ignored';

export interface IWebhookEvent extends Document {
  provider: string;
  eventId: string;
  eventType: string;
  processingStatus: WebhookProcessingStatus;
  payloadHash?: string;
  error?: string;
  receivedAt: Date;
  processedAt?: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    provider: {
      type: String,
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    processingStatus: {
      type: String,
      enum: ['received', 'processed', 'failed', 'ignored'],
      default: 'received',
      index: true,
    },
    payloadHash: {
      type: String,
    },
    error: {
      type: String,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: false,
  },
);

export const WebhookEvent: mongoose.Model<IWebhookEvent> =
  (mongoose.models.WebhookEvent as mongoose.Model<IWebhookEvent>) ||
  mongoose.model<IWebhookEvent>('WebhookEvent', WebhookEventSchema);
