import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReactionType = 'love' | 'rocket' | 'fire' | 'insightful' | 'like';

export interface IProjectReaction extends Document {
  projectId: Types.ObjectId;
  userId?: Types.ObjectId;
  identifier: string; // userId or sha256(ip)
  reaction: ReactionType;
  createdAt: Date;
}

const ProjectReactionSchema = new Schema<IProjectReaction>(
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
    identifier: {
      type: String,
      required: true,
      index: true,
    },
    reaction: {
      type: String,
      enum: ['love', 'rocket', 'fire', 'insightful', 'like'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

ProjectReactionSchema.index({ projectId: 1, identifier: 1, reaction: 1 }, { unique: true });

export const ProjectReaction: mongoose.Model<IProjectReaction> =
  (mongoose.models.ProjectReaction as mongoose.Model<IProjectReaction>) ||
  mongoose.model<IProjectReaction>('ProjectReaction', ProjectReactionSchema);
