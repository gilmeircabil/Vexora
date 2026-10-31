import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDeveloperMessage extends Document {
  recipientProfileId: Types.ObjectId;
  recipientUserId: Types.ObjectId;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  ipHash: string;
  isRead: boolean;
  createdAt: Date;
}

const DeveloperMessageSchema = new Schema<IDeveloperMessage>(
  {
    recipientProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'DeveloperProfile',
      required: true,
      index: true,
    },
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    senderEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    ipHash: {
      type: String,
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

DeveloperMessageSchema.index({ recipientProfileId: 1, createdAt: -1 });

export const DeveloperMessage: mongoose.Model<IDeveloperMessage> =
  (mongoose.models.DeveloperMessage as mongoose.Model<IDeveloperMessage>) ||
  mongoose.model<IDeveloperMessage>('DeveloperMessage', DeveloperMessageSchema);
