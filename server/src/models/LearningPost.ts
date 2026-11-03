import mongoose, { Schema, type Document, type Types } from 'mongoose';

export const LEARNING_CATEGORIES = [
  'Web Development',
  'Frontend Development',
  'Backend Development',
  'Programming',
  'AI and Machine Learning',
  'Cybersecurity',
  'UI/UX Design',
  'Databases',
  'Tutorials',
  'Project Ideas',
  'Learning Journey',
  'Resources',
  'General Discussion',
] as const;

export const OPEN_LEARNING_TOPICS = [
  'Programming',
  'Technology',
  'Web Development',
  'Frontend Development',
  'Backend Development',
  'AI and Machine Learning',
  'Cybersecurity',
  'UI/UX Design',
  'Databases',
  'Business',
  'Entrepreneurship',
  'Finance',
  'Photography',
  'Graphic Design',
  'Cooking',
  'Science',
  'Mathematics',
  'Music',
  'Languages',
  'Personal Development',
  'Education',
  'Lifestyle',
  'Hobbies',
  'Tutorials',
  'Project Ideas',
  'Learning Journey',
  'Resources',
  'General Discussion',
] as const;

export type LearningCategory = string;

export const LEARNING_CONTENT_TYPES = [
  'article',
  'video',
  'pdf',
  'file',
  'course',
  'guide',
  'code',
  'discussion',
] as const;

export type LearningContentType = (typeof LEARNING_CONTENT_TYPES)[number];

export type LearningDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type LearningPricingType = 'free' | 'paid';

export type LearningPostStatus = 'draft' | 'published' | 'hidden' | 'archived' | 'removed';

export interface ILearningLessonResource {
  name: string;
  fileId?: string;
  url?: string;
  size?: number;
  mimeType?: string;
}

export interface ILearningCourseLesson {
  _id?: Types.ObjectId;
  lessonId: string;
  title: string;
  contentType: 'text' | 'video' | 'pdf' | 'code' | 'file';
  content: string;
  videoUrl?: string;
  durationMinutes?: number;
  isFreePreview?: boolean;
  order: number;
  resources?: ILearningLessonResource[];
}

export interface ILearningCourseChapter {
  _id?: Types.ObjectId;
  chapterId: string;
  title: string;
  description?: string;
  order: number;
  lessons: ILearningCourseLesson[];
}

export interface ILearningStep {
  stepNumber: number;
  title: string;
  content: string;
  codeSnippet?: string;
}

export interface ILearningCodeSnippet {
  title: string;
  language: string;
  code: string;
}

export interface ILearningProtectedFile {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  isPreview?: boolean;
}

export interface ILearningPost extends Document {
  authorId: Types.ObjectId;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentType: LearningContentType;
  category: string;
  tags: string[];
  difficulty: LearningDifficulty;
  readTimeMinutes: number;
  coverImage?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  resourceLinks: Array<{ label: string; url: string }>;
  pricingType: LearningPricingType;
  price: number;
  currency: string;
  previewContent?: string;
  learningOutcomes: string[];
  chapters: ILearningCourseChapter[];
  steps: ILearningStep[];
  codeSnippets: ILearningCodeSnippet[];
  protectedFiles: ILearningProtectedFile[];
  rightsConfirmed: boolean;
  rightsConfirmedAt?: Date;
  status: LearningPostStatus;
  isFeatured: boolean;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const lessonResourceSchema = new Schema<ILearningLessonResource>(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    fileId: { type: String, trim: true },
    url: { type: String, trim: true, maxlength: 500 },
    size: { type: Number, min: 0 },
    mimeType: { type: String, trim: true, maxlength: 120 },
  },
  { _id: false },
);

const courseLessonSchema = new Schema<ILearningCourseLesson>(
  {
    lessonId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    contentType: {
      type: String,
      enum: ['text', 'video', 'pdf', 'code', 'file'],
      default: 'text',
    },
    content: { type: String, default: '', maxlength: 50000 },
    videoUrl: { type: String, trim: true, maxlength: 500 },
    durationMinutes: { type: Number, default: 5, min: 0, max: 600 },
    isFreePreview: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    resources: { type: [lessonResourceSchema], default: [] },
  },
  { _id: true },
);

const courseChapterSchema = new Schema<ILearningCourseChapter>(
  {
    chapterId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    order: { type: Number, default: 0 },
    lessons: { type: [courseLessonSchema], default: [] },
  },
  { _id: true },
);

const stepSchema = new Schema<ILearningStep>(
  {
    stepNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 20000 },
    codeSnippet: { type: String, default: '', maxlength: 20000 },
  },
  { _id: false },
);

const codeSnippetSchema = new Schema<ILearningCodeSnippet>(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    language: { type: String, default: 'typescript', trim: true, maxlength: 50 },
    code: { type: String, required: true, maxlength: 50000 },
  },
  { _id: false },
);

const protectedFileSchema = new Schema<ILearningProtectedFile>(
  {
    fileId: { type: String, required: true, trim: true },
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    mimeType: { type: String, required: true, trim: true, maxlength: 120 },
    size: { type: Number, required: true, min: 0 },
    storageKey: { type: String, required: true, trim: true },
    isPreview: { type: Boolean, default: false },
  },
  { _id: false },
);

const learningPostSchema = new Schema<ILearningPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    authorUsername: {
      type: String,
      trim: true,
    },
    authorAvatar: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 180,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 360,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100000,
    },
    contentType: {
      type: String,
      enum: LEARNING_CONTENT_TYPES,
      default: 'article',
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      default: 'General Discussion',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    readTimeMinutes: {
      type: Number,
      default: 3,
      min: 1,
      max: 1200,
    },
    coverImage: {
      type: String,
      default: '',
      maxlength: 500,
    },
    thumbnailUrl: {
      type: String,
      default: '',
      maxlength: 500,
    },
    videoUrl: {
      type: String,
      default: '',
      maxlength: 500,
    },
    resourceLinks: {
      type: [
        {
          label: { type: String, required: true, trim: true, maxlength: 100 },
          url: { type: String, required: true, trim: true, maxlength: 500 },
        },
      ],
      default: [],
    },
    pricingType: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free',
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000000,
      index: true,
    },
    currency: {
      type: String,
      default: 'PHP',
      uppercase: true,
      trim: true,
      maxlength: 5,
    },
    previewContent: {
      type: String,
      default: '',
      maxlength: 10000,
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    chapters: {
      type: [courseChapterSchema],
      default: [],
    },
    steps: {
      type: [stepSchema],
      default: [],
    },
    codeSnippets: {
      type: [codeSnippetSchema],
      default: [],
    },
    protectedFiles: {
      type: [protectedFileSchema],
      default: [],
    },
    rightsConfirmed: {
      type: Boolean,
      default: true,
    },
    rightsConfirmedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'hidden', 'archived', 'removed'],
      default: 'published',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookmarksCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

learningPostSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
learningPostSchema.index({ status: 1, category: 1, createdAt: -1 });
learningPostSchema.index({ status: 1, pricingType: 1, price: 1, createdAt: -1 });
learningPostSchema.index({ status: 1, contentType: 1, createdAt: -1 });
learningPostSchema.index({ status: 1, averageRating: -1, reviewCount: -1 });
learningPostSchema.index({ status: 1, likesCount: -1, viewsCount: -1 });
learningPostSchema.index({
  title: 'text',
  excerpt: 'text',
  content: 'text',
  category: 'text',
  tags: 'text',
});

export const LearningPost = mongoose.model<ILearningPost>('LearningPost', learningPostSchema);

export const LearningContent = LearningPost;
