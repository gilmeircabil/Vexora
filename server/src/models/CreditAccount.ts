import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICreditAccount extends Document {
  userId: Types.ObjectId;
  dailyAllowance: number;
  dailyUsed: number;
  dailyResetAt: Date;
  monthlyAllowance: number;
  monthlyUsed: number;
  reservedCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

const CreditAccountSchema = new Schema<ICreditAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    dailyAllowance: {
      type: Number,
      default: 10,
      min: 0,
    },
    dailyUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyResetAt: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setUTCHours(0, 0, 0, 0);
        return d;
      },
      index: true,
    },
    monthlyAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlyUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const CreditAccount: mongoose.Model<ICreditAccount> =
  (mongoose.models.CreditAccount as mongoose.Model<ICreditAccount>) ||
  mongoose.model<ICreditAccount>('CreditAccount', CreditAccountSchema);
