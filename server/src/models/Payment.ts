import mongoose, { Schema, Document, Types } from 'mongoose';

export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  provider: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  subscriptionId?: Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
    },
    providerPaymentId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['succeeded', 'pending', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

export const Payment: mongoose.Model<IPayment> =
  (mongoose.models.Payment as mongoose.Model<IPayment>) ||
  mongoose.model<IPayment>('Payment', PaymentSchema);
