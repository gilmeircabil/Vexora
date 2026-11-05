import mongoose, { Schema, Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type EducationRole = 'student' | 'teacher' | 'educator';
export type AccountStatus = 'active' | 'unverified' | 'locked' | 'suspended';

export interface OAuthProviderInfo {
  id: string;
  email?: string;
  username?: string;
  picture?: string;
  linkedAt: Date;
}

export interface IUser extends Document {
  username: string;
  name: string;
  email?: string;
  passwordHash?: string;
  recoveryCodeHash?: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  educationRole?: EducationRole;
  emailVerified: boolean;
  emailVerifiedAt?: Date | null;
  accountStatus: AccountStatus;
  failedLoginAttempts: number;
  lockoutUntil?: Date | null;
  lastLoginAt?: Date | null;
  tokenVersion: number;
  isSuspended?: boolean;
  suspensionReason?: string;
  subscriptionId?: Types.ObjectId;
  storageUsedBytes: number;              // Total storage used by user (bytes)
  storageQuotaBytes: number;             // Storage quota limit (bytes)
  oauthProviders?: {
    google?: OAuthProviderInfo;
    github?: OAuthProviderInfo;
    facebook?: OAuthProviderInfo;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'support',
  'system',
  'root',
  'moderator',
  'mod',
  'vexora',
  'vexoramods',
  'help',
  'api',
  'auth',
  'security',
  'billing',
  'staff',
  'guest',
  'anonymous',
  'official',
  'developer',
  'null',
  'undefined',
]);

/**
 * Validates username based on platform requirements:
 * - 3 to 20 characters
 * - Letters, numbers, and underscores only
 * - No spaces
 * - Rejects reserved usernames
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required.' };
  }
  const clean = username.trim();
  if (clean.length < 3 || clean.length > 20) {
    return { valid: false, error: 'Username must be between 3 and 20 characters.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return {
      valid: false,
      error:
        'Username can only contain letters, numbers, and underscores (no spaces or special symbols).',
    };
  }
  if (RESERVED_USERNAMES.has(clean.toLowerCase())) {
    return { valid: false, error: 'This username is reserved and cannot be registered.' };
  }
  return { valid: true };
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: false,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false,
      default: '',
    },
    recoveryCodeHash: {
      type: String,
      default: '',
      index: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    oauthProviders: {
      google: {
        id: { type: String },
        email: { type: String },
        picture: { type: String },
        linkedAt: { type: Date },
      },
      github: {
        id: { type: String },
        username: { type: String },
        avatarUrl: { type: String },
        linkedAt: { type: Date },
      },
      facebook: {
        id: { type: String },
        email: { type: String },
        name: { type: String },
        linkedAt: { type: Date },
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    educationRole: {
      type: String,
      enum: ['student', 'teacher', 'educator'],
      default: 'student',
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: true,
      index: true,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'unverified', 'locked', 'suspended'],
      default: 'active',
      index: true,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },
    suspensionReason: {
      type: String,
      default: '',
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    storageUsedBytes: {
      type: Number,
      default: 0,
      index: true,
    },
    storageQuotaBytes: {
      type: Number,
      default: 524288000, // 500 MB default
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User: mongoose.Model<IUser> =
  (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
