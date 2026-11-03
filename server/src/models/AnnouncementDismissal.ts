import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnnouncementDismissal extends Document {
  _id: Types.ObjectId;
  announcementId: Types.ObjectId;
  userId: Types.ObjectId;
  dismissedAt: Date;
}

const AnnouncementDismissalSchema = new Schema<IAnnouncementDismissal>(
  {
    announcementId: {
      type: Schema.Types.ObjectId,
      ref: 'Announcement',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dismissedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
  },
);

// Compound unique index to prevent duplicate dismissal records
AnnouncementDismissalSchema.index({ announcementId: 1, userId: 1 }, { unique: true });

export const AnnouncementDismissal: mongoose.Model<IAnnouncementDismissal> =
  (mongoose.models.AnnouncementDismissal as mongoose.Model<IAnnouncementDismissal>) ||
  mongoose.model<IAnnouncementDismissal>('AnnouncementDismissal', AnnouncementDismissalSchema);
