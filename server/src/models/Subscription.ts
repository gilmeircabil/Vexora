import mongoose, { Schema, Document, Types } from 'mongoose';
import type { PlanTier, BillingInterval } from '../config/plans.js';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'expired' | 'trialing';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  plan: PlanTier;
  billingInterval: BillingInterval;
  provider: string;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
      required: true,
    },
    billingInterval: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
      required: true,
    },
    provider: {
      type: String,
      default: 'system',
    },
    providerCustomerId: {
      type: String,
      index: true,
    },
    providerSubscriptionId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'expired', 'trialing'],
      default: 'active',
      index: true,
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Subscription: mongoose.Model<ISubscription> =
  (mongoose.models.Subscription as mongoose.Model<ISubscription>) ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
