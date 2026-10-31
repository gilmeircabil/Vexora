import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReportTargetType = 'profile' | 'project';
export type ReportReason = 'spam' | 'inappropriate' | 'impersonation' | 'copyright' | 'other';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface IDeveloperReport extends Document {
  reporterId?: Types.ObjectId;
  reporterEmail?: string;
  targetType: ReportTargetType;
  targetId: Types.ObjectId;
  targetIdentifier?: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  actionTaken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeveloperReportSchema = new Schema<IDeveloperReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    reporterEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    targetType: {
      type: String,
      enum: ['profile', 'project'],
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetIdentifier: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'impersonation', 'copyright', 'other'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    actionTaken: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

DeveloperReportSchema.index({ status: 1, createdAt: -1 });

export const DeveloperReport: mongoose.Model<IDeveloperReport> =
  (mongoose.models.DeveloperReport as mongoose.Model<IDeveloperReport>) ||
  mongoose.model<IDeveloperReport>('DeveloperReport', DeveloperReportSchema);
