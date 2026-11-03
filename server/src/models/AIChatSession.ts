import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatAttachmentMeta {
  name: string;
  mimeType: string;
  size: number;
}

export interface IChatMessageItem {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachment?: IChatAttachmentMeta;
}

export interface IAIChatSession extends Document {
  userId: Types.ObjectId;
  title: string;
  selectedModel: string;
  messages: IChatMessageItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatAttachmentMetaSchema = new Schema<IChatAttachmentMeta>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    mimeType: { type: String, required: true, trim: true, maxlength: 100 },
    size: { type: Number, required: true },
  },
  { _id: false },
);

const ChatMessageItemSchema = new Schema<IChatMessageItem>(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, default: '', maxlength: 15000 },
    timestamp: { type: Number, required: true },
    attachment: { type: ChatAttachmentMetaSchema, required: false },
  },
  { _id: false },
);

const AIChatSessionSchema = new Schema<IAIChatSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxlength: 120,
    },
    selectedModel: {
      type: String,
      default: 'gemini-3.5-flash-lite',
      trim: true,
      maxlength: 100,
    },
    messages: {
      type: [ChatMessageItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
// 1. Fast retrieval by user and recency
AIChatSessionSchema.index({ userId: 1, updatedAt: -1 });

// 2. Native TTL index: 12 days = 12 * 24 * 60 * 60 = 1,036,800 seconds
AIChatSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 12 * 24 * 60 * 60 });

export const AIChatSession: mongoose.Model<IAIChatSession> =
  (mongoose.models.AIChatSession as mongoose.Model<IAIChatSession>) ||
  mongoose.model<IAIChatSession>('AIChatSession', AIChatSessionSchema);
