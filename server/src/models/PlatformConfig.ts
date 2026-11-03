import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMaintenanceConfig {
  global: boolean;
  title: string;
  message: string;
  estimatedReturn?: string;
  pages: {
    HOME: boolean;
    TOOLS: boolean;
    STUDIO: boolean;
    LEARNING: boolean;
    STUDY_SPACE: boolean;
    COMMUNITY: boolean;
    REVIEWS: boolean;
    DASHBOARD: boolean;
    ABOUT: boolean;
    PRIVACY: boolean;
    TERMS: boolean;
    LICENSES: boolean;
    CONTRIBUTING: boolean;
    [key: string]: boolean;
  };
}

export const DEFAULT_MAINTENANCE_CONFIG: IMaintenanceConfig = {
  global: false,
  title: 'Scheduled Maintenance',
  message: 'This section is currently undergoing maintenance and improvements. Please check back shortly.',
  estimatedReturn: '',
  pages: {
    HOME: false,
    TOOLS: false,
    STUDIO: false,
    LEARNING: false,
    STUDY_SPACE: false,
    COMMUNITY: false,
    REVIEWS: false,
    DASHBOARD: false,
    ABOUT: false,
    PRIVACY: false,
    TERMS: false,
    LICENSES: false,
    CONTRIBUTING: false,
  },
};

export interface IPlatformConfig extends Document {
  key: string;
  contactEmail: string;
  githubUrl: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    discord?: string;
    linkedin?: string;
    youtube?: string;
  };
  featuredToolIds: string[];
  heroHeadline: string;
  heroDescription: string;
  aboutMission: string;
  maintenance: IMaintenanceConfig;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}

const PlatformConfigSchema = new Schema<IPlatformConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true,
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    socialLinks: {
      github: { type: String, default: '' },
      twitter: { type: String, default: '' },
      discord: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    featuredToolIds: {
      type: [String],
      default: [
        'smart-image-studio',
        'ai-image-enhancer',
        'ai-background-remover',
        'pdf-merger',
        'json-formatter',
        'qr-code-generator',
      ],
    },
    heroHeadline: {
      type: String,
      default: 'Everything You Need. One Platform.',
      trim: true,
    },
    heroDescription: {
      type: String,
      default:
        'Discover free online tools, explore AI-powered utilities, create designs, and learn with a growing community.',
      trim: true,
    },
    aboutMission: {
      type: String,
      default:
        'VexoraMods exists to provide essential digital tools, AI-assisted utilities, an online design studio, and a collaborative learning community—100% free and open source for everyone.',
      trim: true,
    },
    maintenance: {
      global: { type: Boolean, default: false },
      title: { type: String, default: 'Scheduled Maintenance', trim: true },
      message: {
        type: String,
        default:
          'This section is currently undergoing maintenance and improvements. Please check back shortly.',
        trim: true,
      },
      estimatedReturn: { type: String, default: '', trim: true },
      pages: {
        HOME: { type: Boolean, default: false },
        TOOLS: { type: Boolean, default: false },
        STUDIO: { type: Boolean, default: false },
        LEARNING: { type: Boolean, default: false },
        STUDY_SPACE: { type: Boolean, default: false },
        COMMUNITY: { type: Boolean, default: false },
        REVIEWS: { type: Boolean, default: false },
        DASHBOARD: { type: Boolean, default: false },
        ABOUT: { type: Boolean, default: false },
        PRIVACY: { type: Boolean, default: false },
        TERMS: { type: Boolean, default: false },
        LICENSES: { type: Boolean, default: false },
        CONTRIBUTING: { type: Boolean, default: false },
      },
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

export interface IContactInquiry extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: Date;
}

const ContactInquirySchema = new Schema<IContactInquiry>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: { type: String, enum: ['unread', 'read', 'archived'], default: 'unread' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const PlatformConfig: mongoose.Model<IPlatformConfig> =
  (mongoose.models.PlatformConfig as mongoose.Model<IPlatformConfig>) ||
  mongoose.model<IPlatformConfig>('PlatformConfig', PlatformConfigSchema);

export const ContactInquiry: mongoose.Model<IContactInquiry> =
  (mongoose.models.ContactInquiry as mongoose.Model<IContactInquiry>) ||
  mongoose.model<IContactInquiry>('ContactInquiry', ContactInquirySchema);
