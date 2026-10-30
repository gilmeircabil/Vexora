import mongoose, { Schema, Document, Types } from 'mongoose';

export type TransactionType =
  | 'daily_reset'
  | 'monthly_grant'
  | 'reservation'
  | 'consumption'
  | 'refund'
  | 'admin_adjustment'
  | 'purchase';

export type TransactionStatus = 'reserved' | 'committed' | 'refunded' | 'failed';

export interface ICreditTransaction extends Document {
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  tool?: string;
  jobId?: Types.ObjectId;
  idempotencyKey?: string;
  description: string;
  status: TransactionStatus;
  adminId?: Types.ObjectId;
  auditReason?: string;
  createdAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'daily_reset',
        'monthly_grant',
        'reservation',
        'consumption',
        'refund',
        'admin_adjustment',
        'purchase',
      ],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tool: {
      type: String,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'AIJob',
      index: true,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['reserved', 'committed', 'refunded', 'failed'],
      default: 'committed',
      index: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    auditReason: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const CreditTransaction: mongoose.Model<ICreditTransaction> =
  (mongoose.models.CreditTransaction as mongoose.Model<ICreditTransaction>) ||
  mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);
