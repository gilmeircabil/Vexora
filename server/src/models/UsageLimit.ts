import mongoose, { Schema, Document, Types } from 'mongoose';

export type LimitCategory = 'auth' | 'api' | 'upload' | 'ai' | 'learning' | 'studySpace' | 'studio' | 'community' | 'reviews' | 'jobs' | 'storage' | 'payment';

export type LimitAction =
  | 'register' | 'login' | 'logout' | 'passwordRecovery' | 'changePassword'
  | 'apiRequest' | 'search' | 'upload' | 'download' | 'view'
  | 'enhance' | 'backgroundRemover' | 'ocr' | 'mp3Conversion' | 'mp4Conversion'
  | 'documentToQuiz' | 'chat' | 'writingAssistant' | 'codeAssistant' | 'documentAssistant'
  | 'quiz' | 'flashcard' | 'quizAttempt' | 'note' | 'worksheet' | 'lessonPlan' | 'exam'
  | 'createProject' | 'editProject' | 'exportProject' | 'deleteProject' | 'assetUpload' | 'assetDelete'
  | 'learningPost' | 'learningComment' | 'learningReview' | 'learningBookmark' | 'learningReaction'
  | 'communityPost' | 'communityComment' | 'reaction' | 'report'
  | 'submitReview' | 'submitRating' | 'reportAbuse'
  | 'jobQueue' | 'jobProcess' | 'jobCancel' | 'jobGet'
  | 'storageUsage' | 'storageCleanup'
  | 'checkout' | 'verifySandbox' | 'refund';

export interface IUsageLimit extends Document {
  userId?: Types.ObjectId;
  ipAddress?: string;
  category: LimitCategory;
  action: LimitAction;
  windowStart: Date;
  count: number;
  limit: number;
  resetAt: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UsageLimitSchema = new Schema<IUsageLimit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
      index: true,
    },
    category: {
      type: String,
      enum: ['auth', 'api', 'upload', 'ai', 'learning', 'studySpace', 'studio', 'community', 'reviews', 'jobs', 'storage', 'payment'],
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    windowStart: {
      type: Date,
      required: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
    limit: {
      type: Number,
      required: true,
    },
    resetAt: {
      type: Date,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
UsageLimitSchema.index({ userId: 1, category: 1, action: 1, resetAt: 1 }, { unique: true });
UsageLimitSchema.index({ ipAddress: 1, category: 1, action: 1, resetAt: 1 }, { unique: true, sparse: true });
UsageLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 7776000 }); // TTL index: 90 days

export const UsageLimit: mongoose.Model<IUsageLimit> =
  (mongoose.models.UsageLimit as mongoose.Model<IUsageLimit>) ||
  mongoose.model<IUsageLimit>('UsageLimit', UsageLimitSchema);

// Helper function to generate a composite key for rate limiting
export function generateLimitKey(userId?: Types.ObjectId, ipAddress?: string): string {
  if (userId) return `user:${userId}`;
  if (ipAddress) return `ip:${ipAddress}`;
  return 'anonymous';
}

// Helper function to get current time window start
export function getWindowStart(windowMs: number): Date {
  const now = new Date();
  return new Date(now.getTime() - (now.getTime() % windowMs));
}