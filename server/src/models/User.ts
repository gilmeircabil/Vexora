import mongoose, { Schema, Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface OAuthProviderInfo {
  id: string;
  email?: string;
  username?: string;
  picture?: string;
  linkedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  subscriptionId?: Types.ObjectId;
  oauthProviders?: {
    google?: OAuthProviderInfo;
    github?: OAuthProviderInfo;
    facebook?: OAuthProviderInfo;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
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
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
  },
  {
    timestamps: true,
  },
);

export const User: mongoose.Model<IUser> =
  (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
