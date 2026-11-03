import mongoose, { Schema, type Document, type Types } from 'mongoose';

// ---------------------------------------------------------------------------
// 1. LearningPurchase — Tracks paid content checkout sessions & verified sales
// ---------------------------------------------------------------------------

export type LearningPurchaseStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface ILearningPurchase extends Document {
  buyerId: Types.ObjectId;
  postId: Types.ObjectId;
  creatorId: Types.ObjectId;
  amount: number;
  currency: string;
  platformFee: number;
  processingFee: number;
  creatorNetEarnings: number;
  paymentProvider: 'stripe' | 'paymongo' | 'sandbox';
  providerSessionId: string;
  providerPaymentId?: string;
  status: LearningPurchaseStatus;
  verifiedAt?: Date;
  refundedAt?: Date;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const learningPurchaseSchema = new Schema<ILearningPurchase>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningPost',
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'PHP',
      uppercase: true,
    },
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    processingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    creatorNetEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentProvider: {
      type: String,
      enum: ['stripe', 'paymongo', 'sandbox'],
      required: true,
    },
    providerSessionId: {
      type: String,
      required: true,
      index: true,
    },
    providerPaymentId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    verifiedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    refundReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

learningPurchaseSchema.index({ buyerId: 1, postId: 1, status: 1 });
learningPurchaseSchema.index({ creatorId: 1, status: 1, createdAt: -1 });

export const LearningPurchase = mongoose.model<ILearningPurchase>(
  'LearningPurchase',
  learningPurchaseSchema,
);

// ---------------------------------------------------------------------------
// 2. LearningEntitlement — Preserves permanent learner access across price changes
// ---------------------------------------------------------------------------

export type LearningEntitlementSource = 'purchase' | 'free_enrollment' | 'admin_grant';

export interface ILearningEntitlement extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  source: LearningEntitlementSource;
  purchaseId?: Types.ObjectId;
  isActive: boolean;
  grantedAt: Date;
  revokedAt?: Date;
  revokeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const learningEntitlementSchema = new Schema<ILearningEntitlement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningPost',
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['purchase', 'free_enrollment', 'admin_grant'],
      required: true,
    },
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningPurchase',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
    },
    revokeReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

learningEntitlementSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const LearningEntitlement = mongoose.model<ILearningEntitlement>(
  'LearningEntitlement',
  learningEntitlementSchema,
);

// ---------------------------------------------------------------------------
// 3. LearningProgress — Learner library, course lesson completion & history
// ---------------------------------------------------------------------------

export interface ILearningProgress extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  isSavedToLibrary: boolean;
  completedLessonIds: string[];
  progressPercent: number;
  isCompleted: boolean;
  completedAt?: Date;
  lastViewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const learningProgressSchema = new Schema<ILearningProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningPost',
      required: true,
      index: true,
    },
    isSavedToLibrary: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedLessonIds: {
      type: [String],
      default: [],
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

learningProgressSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const LearningProgress = mongoose.model<ILearningProgress>(
  'LearningProgress',
  learningProgressSchema,
);

// ---------------------------------------------------------------------------
// 4. LearningReview — Dedicated 1-5 star ratings & reviews (separate from comments)
// ---------------------------------------------------------------------------

export interface ILearningReview extends Document {
  postId: Types.ObjectId;
  creatorId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  status: 'approved' | 'hidden' | 'pending';
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const learningReviewSchema = new Schema<ILearningReview>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'LearningPost',
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2500,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['approved', 'hidden', 'pending'],
      default: 'approved',
      index: true,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

learningReviewSchema.index({ postId: 1, userId: 1 }, { unique: true });
learningReviewSchema.index({ postId: 1, status: 1, createdAt: -1 });
learningReviewSchema.index({ creatorId: 1, status: 1 });

export const LearningReview = mongoose.model<ILearningReview>(
  'LearningReview',
  learningReviewSchema,
);

// ---------------------------------------------------------------------------
// 5. CreatorProfile & CreatorFollow — Creator profiles and follower network
// ---------------------------------------------------------------------------

export interface ICreatorProfile extends Document {
  userId: Types.ObjectId;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  headline: string;
  expertise: string[];
  interests: string[];
  websiteUrl?: string;
  payoutMethod?: 'bank_transfer' | 'gcash' | 'paypal' | 'stripe_connect' | '';
  payoutAccountInfo?: string;
  followersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const creatorProfileSchema = new Schema<ICreatorProfile>(
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
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 1200,
    },
    headline: {
      type: String,
      default: '',
      maxlength: 160,
    },
    expertise: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    websiteUrl: {
      type: String,
      default: '',
      maxlength: 300,
    },
    payoutMethod: {
      type: String,
      enum: ['bank_transfer', 'gcash', 'paypal', 'stripe_connect', ''],
      default: '',
    },
    payoutAccountInfo: {
      type: String,
      default: '',
      maxlength: 500,
    },
    followersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const CreatorProfile = mongoose.model<ICreatorProfile>(
  'CreatorProfile',
  creatorProfileSchema,
);

export interface ICreatorFollow extends Document {
  followerId: Types.ObjectId;
  creatorId: Types.ObjectId;
  createdAt: Date;
}

const creatorFollowSchema = new Schema<ICreatorFollow>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

creatorFollowSchema.index({ followerId: 1, creatorId: 1 }, { unique: true });

export const CreatorFollow = mongoose.model<ICreatorFollow>('CreatorFollow', creatorFollowSchema);

// ---------------------------------------------------------------------------
// 6. CreatorPayout — Creator payout requests and payout status history
// ---------------------------------------------------------------------------

export type CreatorPayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface ICreatorPayout extends Document {
  creatorId: Types.ObjectId;
  amount: number;
  currency: string;
  payoutMethod: string;
  payoutAccountInfo: string;
  status: CreatorPayoutStatus;
  adminNotes?: string;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const creatorPayoutSchema = new Schema<ICreatorPayout>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: 'PHP',
      uppercase: true,
    },
    payoutMethod: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    payoutAccountInfo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

creatorPayoutSchema.index({ creatorId: 1, createdAt: -1 });

export const CreatorPayout = mongoose.model<ICreatorPayout>('CreatorPayout', creatorPayoutSchema);
