import mongoose, { Schema, Document, Types } from 'mongoose';

export type ProjectCategory =
  | 'web'
  | 'mobile'
  | 'desktop'
  | 'ai-ml'
  | 'ui-ux'
  | 'backend'
  | 'api-integration'
  | 'open-source'
  | 'other';

export type ProjectStatus = 'draft' | 'published' | 'archived';

export interface IDeveloperProject extends Document {
  ownerId: Types.ObjectId;
  profileId: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  category: ProjectCategory;
  coverImage?: string;
  screenshots: string[];
  technologies: string[];
  role?: string;
  contributions?: string;
  liveDemoUrl?: string;
  repositoryUrl?: string;
  completionDate?: Date;
  status: ProjectStatus;
  isFeatured: boolean;
  viewCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeveloperProjectSchema = new Schema<IDeveloperProject>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'DeveloperProfile',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000,
    },
    category: {
      type: String,
      enum: [
        'web',
        'mobile',
        'desktop',
        'ai-ml',
        'ui-ux',
        'backend',
        'api-integration',
        'open-source',
        'other',
      ],
      default: 'web',
      index: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    screenshots: {
      type: [String],
      default: [],
    },
    technologies: {
      type: [String],
      default: [],
      index: true,
    },
    role: {
      type: String,
      default: 'Creator',
      trim: true,
      maxlength: 80,
    },
    contributions: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    liveDemoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    repositoryUrl: {
      type: String,
      default: '',
      trim: true,
    },
    completionDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Text search on projects
DeveloperProjectSchema.index({
  title: 'text',
  description: 'text',
  technologies: 'text',
  role: 'text',
});

// Compound indexes
DeveloperProjectSchema.index({ status: 1, publishedAt: -1 });
DeveloperProjectSchema.index({ status: 1, category: 1, publishedAt: -1 });
DeveloperProjectSchema.index({ profileId: 1, status: 1 });

export const DeveloperProject: mongoose.Model<IDeveloperProject> =
  (mongoose.models.DeveloperProject as mongoose.Model<IDeveloperProject>) ||
  mongoose.model<IDeveloperProject>('DeveloperProject', DeveloperProjectSchema);
