import mongoose, { Schema, Document, Types } from 'mongoose';

export type ExperienceLevel = 'beginner' | 'junior' | 'intermediate' | 'senior' | 'expert';
export type RemotePreference = 'remote' | 'hybrid' | 'onsite' | 'flexible';
export type AvailabilityStatus = 'available' | 'open' | 'unavailable';

export interface IDeveloperProfile extends Document {
  userId: Types.ObjectId;
  username: string;
  displayName: string;
  headline: string;
  biography: string;
  profileImage?: string;
  coverImage?: string;
  skills: string[];
  technologies: string[];
  experienceLevel: ExperienceLevel;
  location?: string;
  remotePreference: RemotePreference;
  services: string[];
  availability: AvailabilityStatus;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  contactPreferences: {
    allowContactForm: boolean;
    preferredMethod: 'form' | 'email' | 'linkedin' | 'github';
  };
  isPublished: boolean;
  isFeatured: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeveloperProfileSchema = new Schema<IDeveloperProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
      match: /^[a-z0-9_-]+$/,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    headline: {
      type: String,
      default: '',
      trim: true,
      maxlength: 160,
    },
    biography: {
      type: String,
      default: '',
      trim: true,
      maxlength: 3000,
    },
    profileImage: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    technologies: {
      type: [String],
      default: [],
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'junior', 'intermediate', 'senior', 'expert'],
      default: 'intermediate',
      index: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    remotePreference: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite', 'flexible'],
      default: 'remote',
      index: true,
    },
    services: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: ['available', 'open', 'unavailable'],
      default: 'available',
      index: true,
    },
    portfolioUrl: {
      type: String,
      default: '',
      trim: true,
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: '',
      trim: true,
    },
    websiteUrl: {
      type: String,
      default: '',
      trim: true,
    },
    contactPreferences: {
      allowContactForm: {
        type: Boolean,
        default: true,
      },
      preferredMethod: {
        type: String,
        enum: ['form', 'email', 'linkedin', 'github'],
        default: 'form',
      },
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },
    suspensionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Text index for free-text search across developer names, headlines, biographies, skills, and services
DeveloperProfileSchema.index({
  displayName: 'text',
  headline: 'text',
  biography: 'text',
  skills: 'text',
  technologies: 'text',
  services: 'text',
});

// Compound indexes for faceted directory queries
DeveloperProfileSchema.index({ isPublished: 1, isSuspended: 1, isFeatured: -1, createdAt: -1 });
DeveloperProfileSchema.index({ isPublished: 1, experienceLevel: 1 });
DeveloperProfileSchema.index({ isPublished: 1, availability: 1 });

export const DeveloperProfile: mongoose.Model<IDeveloperProfile> =
  (mongoose.models.DeveloperProfile as mongoose.Model<IDeveloperProfile>) ||
  mongoose.model<IDeveloperProfile>('DeveloperProfile', DeveloperProfileSchema);
