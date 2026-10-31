import mongoose, { Schema, Document, Types } from 'mongoose';

export type DonationPaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';

export interface IDonation extends Document {
  donorUserId?: Types.ObjectId;
  displayName: string;
  donorEmail?: string; // Private, never exposed on leaderboard or public APIs
  isAnonymous: boolean;
  message?: string;
  amount: number;
  currency: string;
  paymentProvider: 'paymongo' | 'sandbox' | 'stripe';
  providerTransactionId: string;
  paymentStatus: DonationPaymentStatus;
  checkoutUrl?: string;
  isModerated: boolean;
  moderatedDisplayName?: string;
  metadata?: Record<string, any>;
  verifiedAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    donorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
      default: 'Anonymous Supporter',
    },
    donorEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      select: false, // Never return email by default to prevent leaking private information
    },
    isAnonymous: {
      type: Boolean,
      default: false,
      index: true,
    },
    message: {
      type: String,
      required: false,
      trim: true,
      maxlength: 280,
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
    paymentProvider: {
      type: String,
      enum: ['paymongo', 'sandbox', 'stripe'],
      default: 'paymongo',
      index: true,
    },
    providerTransactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'canceled', 'refunded'],
      default: 'pending',
      index: true,
    },
    checkoutUrl: {
      type: String,
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderatedDisplayName: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    verifiedAt: {
      type: Date,
      index: true,
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for high-speed leaderboard queries and statistics
DonationSchema.index({ paymentStatus: 1, verifiedAt: -1 });
DonationSchema.index({ paymentStatus: 1, amount: -1 });
DonationSchema.index({ paymentStatus: 1, donorUserId: 1 });

export const Donation: mongoose.Model<IDonation> =
  (mongoose.models.Donation as mongoose.Model<IDonation>) ||
  mongoose.model<IDonation>('Donation', DonationSchema);
