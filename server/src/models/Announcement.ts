import mongoose, { Schema, Document, Types } from 'mongoose';

export type AnnouncementType = 'info' | 'success' | 'warning' | 'important';
export type AnnouncementStatus = 'active' | 'inactive' | 'archived';

export interface IAnnouncement extends Document {
  _id: Types.ObjectId;
  title: string;
  message: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  createdBy: Types.ObjectId;
  createdByName: string;
  publishedAt: Date;
  expiresAt?: Date | null;
  dismissedCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'important'],
      default: 'info',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
      trim: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    dismissedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

AnnouncementSchema.index({ status: 1, publishedAt: -1 });
AnnouncementSchema.index({ expiresAt: 1 });

export const Announcement: mongoose.Model<IAnnouncement> =
  (mongoose.models.Announcement as mongoose.Model<IAnnouncement>) ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
