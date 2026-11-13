import mongoose, { Schema, Document, Types } from 'mongoose';

export type LoveLetterStatus = 'draft' | 'published' | 'revoked';

export interface ILoveLetterCustomization {
  font?: string;
  bgTheme?: string;
  envelopeStyle?: string;
  openingAnimation?: string;
  musicPreset?: string;
  alignment?: 'left' | 'center' | 'right';
  decorativeElements?: string[];
}

export interface ILoveLetter extends Document {
  userId: Types.ObjectId;
  recipientName: string;
  senderName: string;
  isAnonymous: boolean;
  title: string;
  message: string;
  template: string;
  customization: ILoveLetterCustomization;
  attachments: string[];
  publicToken?: string | null;
  status: LoveLetterStatus;
  isPasswordProtected: boolean;
  passwordHash?: string | null;
  scheduledRevealAt?: Date | null;
  expiresAt?: Date | null;
  firstOpenedAt?: Date | null;
  openCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LoveLetterSchema = new Schema<ILoveLetter>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientName: { type: String, required: true, trim: true },
    senderName: { type: String, default: '', trim: true },
    isAnonymous: { type: Boolean, default: false },
    title: { type: String, default: '', trim: true },
    message: { type: String, default: '' },
    template: { type: String, default: 'classic' },
    customization: {
      type: Schema.Types.Mixed,
      default: () => ({
        font: 'serif',
        bgTheme: 'romance',
        envelopeStyle: 'classic-red',
        openingAnimation: 'gentle-unfold',
        musicPreset: 'none',
        alignment: 'center',
        decorativeElements: [],
      }),
    },
    attachments: { type: [String], default: [] },
    publicToken: { type: String, unique: true, sparse: true, index: true },
    status: { type: String, enum: ['draft', 'published', 'revoked'], default: 'draft', index: true },
    isPasswordProtected: { type: Boolean, default: false },
    passwordHash: { type: String, default: null },
    scheduledRevealAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    firstOpenedAt: { type: Date, default: null },
    openCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LoveLetterSchema.index({ userId: 1, createdAt: -1 });

export const LoveLetter = mongoose.model<ILoveLetter>('LoveLetter', LoveLetterSchema);
