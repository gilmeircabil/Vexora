import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProjectComment extends Document {
  projectId: Types.ObjectId;
  userId?: Types.ObjectId;
  authorName: string;
  authorAvatar?: string;
  isAuthor: boolean;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectCommentSchema = new Schema<IProjectComment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'DeveloperProject',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    authorAvatar: {
      type: String,
      default: '',
    },
    isAuthor: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  },
);

ProjectCommentSchema.index({ projectId: 1, createdAt: -1 });

export const ProjectComment: mongoose.Model<IProjectComment> =
  (mongoose.models.ProjectComment as mongoose.Model<IProjectComment>) ||
  mongoose.model<IProjectComment>('ProjectComment', ProjectCommentSchema);
