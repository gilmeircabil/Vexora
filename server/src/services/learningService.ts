import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';
import {
  LearningPost,
  LEARNING_CATEGORIES,
  OPEN_LEARNING_TOPICS,
  LEARNING_CONTENT_TYPES,
  type ILearningPost,
  type LearningCategory,
  type LearningContentType,
  type LearningDifficulty,
  type LearningPricingType,
  type LearningPostStatus,
  type ILearningCourseChapter,
  type ILearningStep,
  type ILearningCodeSnippet,
  type ILearningProtectedFile,
} from '../models/LearningPost.js';
import { LearningComment } from '../models/LearningComment.js';
import { LearningLike } from '../models/LearningLike.js';
import { LearningBookmark } from '../models/LearningBookmark.js';
import {
  LearningReport,
  type LearningReportTargetType,
  type LearningReportCategory,
} from '../models/LearningReport.js';
import {
  LearningPurchase,
  LearningEntitlement,
  LearningProgress,
  LearningReview,
  CreatorProfile,
  CreatorFollow,
  CreatorPayout,
} from '../models/LearningMarketplace.js';
import { User } from '../models/User.js';
import { DeveloperProfile } from '../models/DeveloperProfile.js';
import { WebhookEvent } from '../models/WebhookEvent.js';
import { env } from '../config/env.js';

function sanitizePlain(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

function sanitizeMarkdown(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

function sanitizeUrl(input: unknown): string {
  if (typeof input !== 'string' || !input.trim()) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/api/learning/')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Only http and https URLs are allowed');
    }
    return parsed.toString();
  } catch {
    throw new Error(`Invalid URL: ${trimmed}`);
  }
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const PRIVATE_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'learning_private');

function ensurePrivateUploadDir(): void {
  if (!fs.existsSync(PRIVATE_UPLOAD_DIR)) {
    fs.mkdirSync(PRIVATE_UPLOAD_DIR, { recursive: true });
  }
}

const ALLOWED_LEARNING_MIME_TYPES = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'video/mp4',
  'video/webm',
]);

export interface CreateLearningPostInput {
  title: string;
  excerpt?: string;
  content: string;
  contentType?: LearningContentType;
  category?: LearningCategory;
  tags?: string[];
  difficulty?: LearningDifficulty;
  coverImage?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  resourceLinks?: Array<{ label: string; url: string }>;
  pricingType?: LearningPricingType;
  price?: number;
  currency?: string;
  previewContent?: string;
  learningOutcomes?: string[];
  chapters?: Array<{
    chapterId?: string;
    title: string;
    description?: string;
    order?: number;
    lessons?: Array<{
      lessonId?: string;
      title: string;
      contentType?: 'text' | 'video' | 'pdf' | 'code' | 'file';
      content?: string;
      videoUrl?: string;
      durationMinutes?: number;
      isFreePreview?: boolean;
      order?: number;
      resources?: Array<{
        name: string;
        fileId?: string;
        url?: string;
        size?: number;
        mimeType?: string;
      }>;
    }>;
  }>;
  steps?: Array<{
    stepNumber?: number;
    title: string;
    content: string;
    codeSnippet?: string;
  }>;
  codeSnippets?: Array<{
    title: string;
    language?: string;
    code: string;
  }>;
  protectedFiles?: Array<{
    fileId: string;
    originalName: string;
    mimeType: string;
    size: number;
    storageKey?: string;
    isPreview?: boolean;
  }>;
  rightsConfirmed?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export class LearningService {
  static sanitizePlain = sanitizePlain;

  // --------------------------------------------------------------------------
  // Entitlement & Access Control
  // --------------------------------------------------------------------------

  static async checkUserEntitlement(
    post: Pick<ILearningPost, '_id' | 'authorId' | 'pricingType' | 'price'>,
    viewerUserId?: string,
    isAdmin = false,
  ): Promise<{
    hasAccess: boolean;
    accessReason: 'free' | 'author' | 'admin' | 'entitled' | 'purchased' | 'locked';
  }> {
    if (isAdmin) {
      return { hasAccess: true, accessReason: 'admin' };
    }
    if (viewerUserId && String(post.authorId) === String(viewerUserId)) {
      return { hasAccess: true, accessReason: 'author' };
    }
    if (post.pricingType !== 'paid' || (post.price ?? 0) <= 0) {
      return { hasAccess: true, accessReason: 'free' };
    }
    if (!viewerUserId || !Types.ObjectId.isValid(viewerUserId)) {
      return { hasAccess: false, accessReason: 'locked' };
    }

    const userObjId = new Types.ObjectId(viewerUserId);
    const postObjId = new Types.ObjectId(String(post._id));

    const [entitlement, purchase] = await Promise.all([
      LearningEntitlement.findOne({
        userId: userObjId,
        postId: postObjId,
        isActive: true,
      }).lean(),
      LearningPurchase.findOne({
        buyerId: userObjId,
        postId: postObjId,
        status: 'succeeded',
      }).lean(),
    ]);

    if (entitlement) {
      return { hasAccess: true, accessReason: 'entitled' };
    }
    if (purchase) {
      return { hasAccess: true, accessReason: 'purchased' };
    }

    return { hasAccess: false, accessReason: 'locked' };
  }

  static redactPostForViewer(post: any, hasAccess: boolean, accessReason = 'free'): any {
    const safeProtectedFiles = (post.protectedFiles || []).map((f: any) => ({
      fileId: f.fileId,
      originalName: f.originalName,
      mimeType: f.mimeType,
      size: f.size,
      isPreview: Boolean(f.isPreview),
      isLocked: !hasAccess && !f.isPreview,
      downloadUrl:
        hasAccess || f.isPreview
          ? `/api/learning/posts/${post._id}/files/${f.fileId}/download`
          : null,
    }));

    if (hasAccess) {
      const fullChapters = (post.chapters || []).map((ch: any) => ({
        ...ch,
        lessons: (ch.lessons || []).map((les: any) => ({
          ...les,
          isLocked: false,
        })),
      }));

      return {
        ...post,
        chapters: fullChapters,
        protectedFiles: safeProtectedFiles,
        hasAccess: true,
        accessReason,
      };
    }

    // Viewer is NOT authorized for this paid learning item — strip protected material on the server
    const previewText =
      post.previewContent && post.previewContent.trim().length > 0
        ? post.previewContent
        : post.excerpt;

    const redactedChapters = (post.chapters || []).map((ch: any) => ({
      chapterId: ch.chapterId,
      title: ch.title,
      description: ch.description,
      order: ch.order,
      lessons: (ch.lessons || []).map((les: any) => {
        if (les.isFreePreview) {
          return {
            ...les,
            isLocked: false,
          };
        }
        return {
          lessonId: les.lessonId,
          title: les.title,
          contentType: les.contentType,
          durationMinutes: les.durationMinutes,
          isFreePreview: false,
          order: les.order,
          content: '',
          videoUrl: '',
          resources: [],
          isLocked: true,
        };
      }),
    }));

    const redactedSteps = (post.steps || []).map((step: any, idx: number) => {
      if (idx === 0) return step;
      return {
        stepNumber: step.stepNumber,
        title: step.title,
        content: 'Purchase this guide to unlock the complete step-by-step instructions.',
        codeSnippet: '',
        isLocked: true,
      };
    });

    const redactedCodeSnippets = (post.codeSnippets || []).map((snip: any, idx: number) => {
      if (idx === 0) return snip;
      return {
        title: snip.title,
        language: snip.language,
        code: '// Locked — purchase this learning resource to unlock all code examples.',
        isLocked: true,
      };
    });

    return {
      ...post,
      content: previewText,
      videoUrl: '',
      resourceLinks: [],
      chapters: redactedChapters,
      steps: redactedSteps,
      codeSnippets: redactedCodeSnippets,
      protectedFiles: safeProtectedFiles,
      hasAccess: false,
      accessReason: 'locked',
    };
  }

  // --------------------------------------------------------------------------
  // File Security & Protected Storage (Phase 12)
  // --------------------------------------------------------------------------

  static validateFileSecurity(file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  }): void {
    if (!file || !file.buffer || file.size <= 0) {
      throw new Error('Uploaded file is empty or missing.');
    }
    const maxBytes = 50 * 1024 * 1024; // 50 MB max
    if (file.size > maxBytes) {
      throw new Error('File exceeds the 50MB maximum size limit.');
    }

    const ext = path.extname(file.originalname || '').toLowerCase();
    const forbiddenExtensions = new Set([
      '.exe',
      '.dll',
      '.bat',
      '.cmd',
      '.sh',
      '.msi',
      '.scr',
      '.vbs',
      '.ps1',
      '.com',
      '.jar',
      '.php',
      '.phtml',
      '.elf',
      '.bin',
    ]);
    if (forbiddenExtensions.has(ext)) {
      throw new Error(`Executable or script file extension (${ext}) is prohibited.`);
    }

    // Magic byte inspection for executable / malware headers
    const buf = file.buffer;
    if (buf.length >= 2 && buf[0] === 0x4d && buf[1] === 0x5a) {
      throw new Error('Security check failed: Windows PE/MZ executable signature detected.');
    }
    if (
      buf.length >= 4 &&
      buf[0] === 0x7f &&
      buf[1] === 0x45 &&
      buf[2] === 0x4c &&
      buf[3] === 0x46
    ) {
      throw new Error('Security check failed: ELF executable binary signature detected.');
    }
    if (
      buf.length >= 4 &&
      ((buf[0] === 0xfe &&
        buf[1] === 0xed &&
        buf[2] === 0xfa &&
        (buf[3] === 0xce || buf[3] === 0xcf)) ||
        (buf[0] === 0xcf && buf[1] === 0xfa && buf[2] === 0xed && buf[3] === 0xfe))
    ) {
      throw new Error('Security check failed: Mach-O executable binary signature detected.');
    }

    const headText = buf.subarray(0, Math.min(buf.length, 512)).toString('utf8');
    if (
      /^#!\s*\/bin\/(ba)?sh/i.test(headText) ||
      /<\?php/i.test(headText) ||
      /<script[\s>]/i.test(headText)
    ) {
      throw new Error(
        'Security check failed: Executable script or embedded <script> payload detected.',
      );
    }

    if (!ALLOWED_LEARNING_MIME_TYPES.has(file.mimetype)) {
      throw new Error(`Unsupported file MIME type: ${file.mimetype}`);
    }
  }

  static async uploadProtectedLearningFile(
    _userId: string,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
    isPreview = false,
  ): Promise<ILearningProtectedFile> {
    this.validateFileSecurity(file);
    ensurePrivateUploadDir();

    const fileId = `lf_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const safeOriginal = path
      .basename(file.originalname || 'resource')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 120);
    const storageKey = `${fileId}_${safeOriginal}`;
    const fullPath = path.join(PRIVATE_UPLOAD_DIR, storageKey);

    await fs.promises.writeFile(fullPath, file.buffer);

    return {
      fileId,
      originalName: sanitizePlain(file.originalname || safeOriginal).slice(0, 255),
      mimeType: file.mimetype,
      size: file.size,
      storageKey,
      isPreview: Boolean(isPreview),
    };
  }

  static async getProtectedFileForDownload(
    postId: string,
    fileId: string,
    viewerUserId?: string,
    isAdmin = false,
  ): Promise<{ filePath: string; originalName: string; mimeType: string }> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new Error('Invalid learning material ID');
    }
    const post = await LearningPost.findById(new Types.ObjectId(postId)).lean();
    if (
      !post ||
      (post.status !== 'published' && !isAdmin && String(post.authorId) !== String(viewerUserId))
    ) {
      throw new Error('Learning material not found');
    }

    const fileMeta = (post.protectedFiles || []).find((f) => f.fileId === fileId);
    if (!fileMeta) {
      throw new Error('Requested file resource not found');
    }

    if (!fileMeta.isPreview) {
      const access = await this.checkUserEntitlement(post, viewerUserId, isAdmin);
      if (!access.hasAccess) {
        throw new Error(
          'Purchase required: You do not have access to download this protected file.',
        );
      }
    }

    const safeFileName = path.basename(fileMeta.storageKey);
    const fullPath = path.join(PRIVATE_UPLOAD_DIR, safeFileName);
    if (!fs.existsSync(fullPath)) {
      throw new Error('Protected file is missing from storage');
    }

    return {
      filePath: fullPath,
      originalName: fileMeta.originalName,
      mimeType: fileMeta.mimeType,
    };
  }

  // --------------------------------------------------------------------------
  // Content Normalization Helpers
  // --------------------------------------------------------------------------

  private static normalizeChapters(
    chaptersInput?: CreateLearningPostInput['chapters'],
  ): ILearningCourseChapter[] {
    if (!Array.isArray(chaptersInput)) return [];
    return chaptersInput
      .slice(0, 50)
      .map((ch, cIdx) => {
        const chapterId = sanitizePlain(ch.chapterId) || `ch_${cIdx + 1}_${Date.now()}`;
        const lessons = Array.isArray(ch.lessons)
          ? ch.lessons.slice(0, 100).map((les, lIdx) => ({
              lessonId: sanitizePlain(les.lessonId) || `les_${cIdx + 1}_${lIdx + 1}_${Date.now()}`,
              title: sanitizePlain(les.title || `Lesson ${lIdx + 1}`).slice(0, 200),
              contentType: (['text', 'video', 'pdf', 'code', 'file'].includes(les.contentType || '')
                ? les.contentType
                : 'text') as 'text' | 'video' | 'pdf' | 'code' | 'file',
              content: sanitizeMarkdown(les.content || '').slice(0, 50000),
              videoUrl: les.videoUrl ? sanitizeUrl(les.videoUrl) : '',
              durationMinutes: Math.max(0, Math.min(600, Number(les.durationMinutes) || 5)),
              isFreePreview: Boolean(les.isFreePreview),
              order: typeof les.order === 'number' ? les.order : lIdx + 1,
              resources: Array.isArray(les.resources)
                ? les.resources.slice(0, 20).map((r) => ({
                    name: sanitizePlain(r.name).slice(0, 140),
                    fileId: r.fileId ? sanitizePlain(r.fileId) : undefined,
                    url: r.url ? sanitizeUrl(r.url) : undefined,
                    size: typeof r.size === 'number' ? r.size : undefined,
                    mimeType: r.mimeType ? sanitizePlain(r.mimeType) : undefined,
                  }))
                : [],
            }))
          : [];
        lessons.sort((a, b) => a.order - b.order);

        return {
          chapterId,
          title: sanitizePlain(ch.title || `Chapter ${cIdx + 1}`).slice(0, 200),
          description: sanitizePlain(ch.description || '').slice(0, 1000),
          order: typeof ch.order === 'number' ? ch.order : cIdx + 1,
          lessons,
        };
      })
      .sort((a, b) => a.order - b.order);
  }

  private static normalizeSteps(stepsInput?: CreateLearningPostInput['steps']): ILearningStep[] {
    if (!Array.isArray(stepsInput)) return [];
    return stepsInput
      .slice(0, 50)
      .map((s, idx) => ({
        stepNumber: typeof s.stepNumber === 'number' && s.stepNumber > 0 ? s.stepNumber : idx + 1,
        title: sanitizePlain(s.title || `Step ${idx + 1}`).slice(0, 200),
        content: sanitizeMarkdown(s.content || '').slice(0, 20000),
        codeSnippet: typeof s.codeSnippet === 'string' ? s.codeSnippet.slice(0, 20000) : '',
      }))
      .filter((s) => s.title && s.content);
  }

  private static normalizeCodeSnippets(
    snippetsInput?: CreateLearningPostInput['codeSnippets'],
  ): ILearningCodeSnippet[] {
    if (!Array.isArray(snippetsInput)) return [];
    return snippetsInput
      .slice(0, 30)
      .map((snip, idx) => ({
        title: sanitizePlain(snip.title || `Snippet ${idx + 1}`).slice(0, 140),
        language: sanitizePlain(snip.language || 'typescript').slice(0, 50),
        code: typeof snip.code === 'string' ? snip.code.slice(0, 50000) : '',
      }))
      .filter((s) => s.code.trim().length > 0);
  }

  // --------------------------------------------------------------------------
  // Posts & Open Publishing (Phases 1-3)
  // --------------------------------------------------------------------------

  static async createPost(userId: string, input: CreateLearningPostInput): Promise<ILearningPost> {
    const user = await User.findById(new Types.ObjectId(userId));
    if (!user) throw new Error('User not found');
    if (user.isSuspended) throw new Error('Your account is currently suspended');

    const title = sanitizePlain(input.title).slice(0, 180);
    if (title.length < 3) {
      throw new Error('Post title must be at least 3 characters');
    }

    const content = sanitizeMarkdown(input.content);
    if (content.length < 10) {
      throw new Error('Post content must be at least 10 characters');
    }

    const excerpt = input.excerpt
      ? sanitizePlain(input.excerpt).slice(0, 360)
      : sanitizePlain(content.replace(/[#*`_~>-]/g, ' ')).slice(0, 240);

    // Phase 1: Open category system — allow any topic/custom category chosen by creator
    const rawCategory = sanitizePlain(input.category || '').slice(0, 80);
    const category = rawCategory.length >= 2 ? rawCategory : 'General Discussion';

    const contentType: LearningContentType =
      input.contentType && LEARNING_CONTENT_TYPES.includes(input.contentType)
        ? input.contentType
        : 'article';

    const pricingType: LearningPricingType = input.pricingType === 'paid' ? 'paid' : 'free';
    const rawPrice = Number(input.price ?? 0);
    if (pricingType === 'paid' && (!Number.isFinite(rawPrice) || rawPrice <= 0)) {
      throw new Error('Paid learning content must have a valid selling price greater than 0.');
    }
    const price = pricingType === 'paid' ? Math.round(rawPrice * 100) / 100 : 0;
    const currency =
      sanitizePlain(input.currency || 'PHP')
        .toUpperCase()
        .slice(0, 5) || 'PHP';

    // Phase 12: Require creator confirmation of distribution rights for paid or file-bearing content
    if (
      (pricingType === 'paid' || (input.protectedFiles && input.protectedFiles.length > 0)) &&
      input.rightsConfirmed === false
    ) {
      throw new Error(
        'You must confirm that you own the rights to distribute or sell this content.',
      );
    }

    const tags = (input.tags || [])
      .map((t) => sanitizePlain(t).toLowerCase())
      .filter(Boolean)
      .slice(0, 15);

    const learningOutcomes = (input.learningOutcomes || [])
      .map((o) => sanitizePlain(o).slice(0, 240))
      .filter(Boolean)
      .slice(0, 20);

    const resourceLinks = (input.resourceLinks || [])
      .slice(0, 15)
      .map((r) => ({
        label: sanitizePlain(r.label).slice(0, 100),
        url: sanitizeUrl(r.url),
      }))
      .filter((r) => r.label && r.url);

    const chapters = this.normalizeChapters(input.chapters);
    const steps = this.normalizeSteps(input.steps);
    const codeSnippets = this.normalizeCodeSnippets(input.codeSnippets);

    const protectedFiles: ILearningProtectedFile[] = Array.isArray(input.protectedFiles)
      ? input.protectedFiles.slice(0, 20).map((pf) => ({
          fileId: sanitizePlain(pf.fileId),
          originalName: sanitizePlain(pf.originalName).slice(0, 255),
          mimeType: sanitizePlain(pf.mimeType).slice(0, 120),
          size: Math.max(0, Number(pf.size) || 0),
          storageKey: sanitizePlain(pf.storageKey || pf.fileId),
          isPreview: Boolean(pf.isPreview),
        }))
      : [];

    const devProfile = await DeveloperProfile.findOne({
      userId: new Types.ObjectId(userId),
    }).lean();
    const creatorProfile = await CreatorProfile.findOne({
      userId: new Types.ObjectId(userId),
    }).lean();

    const baseSlug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'post';
    let slug = `${baseSlug}-${Date.now().toString(36)}`;
    const existing = await LearningPost.findOne({ slug });
    if (existing) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
    }

    const totalLessonMinutes = chapters.reduce(
      (acc, ch) => acc + ch.lessons.reduce((lAcc, l) => lAcc + (l.durationMinutes || 5), 0),
      0,
    );

    const post = await LearningPost.create({
      authorId: new Types.ObjectId(userId),
      authorName: creatorProfile?.displayName || devProfile?.displayName || user.name,
      authorUsername: creatorProfile?.username || devProfile?.username,
      authorAvatar: creatorProfile?.avatarUrl || devProfile?.profileImage || user.avatarUrl || '',
      title,
      slug,
      excerpt,
      content,
      contentType,
      category,
      tags,
      difficulty: input.difficulty || 'beginner',
      readTimeMinutes:
        contentType === 'course' && totalLessonMinutes > 0
          ? totalLessonMinutes
          : estimateReadTime(content),
      coverImage: input.coverImage ? sanitizeUrl(input.coverImage) : '',
      thumbnailUrl: input.thumbnailUrl
        ? sanitizeUrl(input.thumbnailUrl)
        : input.coverImage
          ? sanitizeUrl(input.coverImage)
          : '',
      videoUrl: input.videoUrl ? sanitizeUrl(input.videoUrl) : '',
      resourceLinks,
      pricingType,
      price,
      currency,
      previewContent: input.previewContent
        ? sanitizeMarkdown(input.previewContent).slice(0, 10000)
        : '',
      learningOutcomes,
      chapters,
      steps,
      codeSnippets,
      protectedFiles,
      rightsConfirmed: input.rightsConfirmed !== false,
      rightsConfirmedAt: new Date(),
      status:
        input.status === 'draft' ? 'draft' : input.status === 'archived' ? 'archived' : 'published',
    });

    return post;
  }

  static async updatePost(
    userId: string,
    postId: string,
    input: Partial<CreateLearningPostInput>,
    isAdmin = false,
  ): Promise<ILearningPost> {
    const post = await LearningPost.findById(new Types.ObjectId(postId));
    if (!post) throw new Error('Post not found');

    if (!isAdmin && String(post.authorId) !== String(userId)) {
      throw new Error('Unauthorized to edit this post');
    }

    if (input.title !== undefined) {
      const title = sanitizePlain(input.title).slice(0, 180);
      if (title.length < 3) throw new Error('Post title must be at least 3 characters');
      post.title = title;
    }

    if (input.content !== undefined) {
      const content = sanitizeMarkdown(input.content);
      if (content.length < 10) throw new Error('Post content must be at least 10 characters');
      post.content = content;
      post.readTimeMinutes = estimateReadTime(content);
    }

    if (input.excerpt !== undefined) {
      post.excerpt = sanitizePlain(input.excerpt).slice(0, 360);
    }

    if (input.contentType !== undefined && LEARNING_CONTENT_TYPES.includes(input.contentType)) {
      post.contentType = input.contentType;
    }

    if (input.category !== undefined) {
      const rawCategory = sanitizePlain(input.category).slice(0, 80);
      if (rawCategory.length >= 2) {
        post.category = rawCategory;
      }
    }

    if (input.tags !== undefined) {
      post.tags = input.tags
        .map((t) => sanitizePlain(t).toLowerCase())
        .filter(Boolean)
        .slice(0, 15);
    }

    if (input.difficulty !== undefined) {
      post.difficulty = input.difficulty;
    }

    if (input.coverImage !== undefined) {
      post.coverImage = input.coverImage ? sanitizeUrl(input.coverImage) : '';
    }

    if (input.thumbnailUrl !== undefined) {
      post.thumbnailUrl = input.thumbnailUrl ? sanitizeUrl(input.thumbnailUrl) : '';
    }

    if (input.videoUrl !== undefined) {
      post.videoUrl = input.videoUrl ? sanitizeUrl(input.videoUrl) : '';
    }

    if (input.resourceLinks !== undefined) {
      post.resourceLinks = input.resourceLinks
        .slice(0, 15)
        .map((r) => ({
          label: sanitizePlain(r.label).slice(0, 100),
          url: sanitizeUrl(r.url),
        }))
        .filter((r) => r.label && r.url);
    }

    // Phase 3: Changing paid <-> free preserves existing LearningPurchase & LearningEntitlement records
    if (input.pricingType !== undefined) {
      post.pricingType = input.pricingType === 'paid' ? 'paid' : 'free';
    }
    if (input.price !== undefined) {
      const rawPrice = Number(input.price);
      if (post.pricingType === 'paid' && (!Number.isFinite(rawPrice) || rawPrice <= 0)) {
        throw new Error('Paid learning content must have a valid selling price greater than 0.');
      }
      post.price = post.pricingType === 'paid' ? Math.round(rawPrice * 100) / 100 : 0;
    } else if (post.pricingType === 'free') {
      post.price = 0;
    }

    if (input.currency !== undefined) {
      post.currency = sanitizePlain(input.currency).toUpperCase().slice(0, 5) || 'PHP';
    }

    if (input.previewContent !== undefined) {
      post.previewContent = sanitizeMarkdown(input.previewContent).slice(0, 10000);
    }

    if (input.learningOutcomes !== undefined) {
      post.learningOutcomes = input.learningOutcomes
        .map((o) => sanitizePlain(o).slice(0, 240))
        .filter(Boolean)
        .slice(0, 20);
    }

    if (input.chapters !== undefined) {
      post.chapters = this.normalizeChapters(input.chapters);
    }

    if (input.steps !== undefined) {
      post.steps = this.normalizeSteps(input.steps);
    }

    if (input.codeSnippets !== undefined) {
      post.codeSnippets = this.normalizeCodeSnippets(input.codeSnippets);
    }

    if (input.protectedFiles !== undefined) {
      post.protectedFiles = input.protectedFiles.slice(0, 20).map((pf) => ({
        fileId: sanitizePlain(pf.fileId),
        originalName: sanitizePlain(pf.originalName).slice(0, 255),
        mimeType: sanitizePlain(pf.mimeType).slice(0, 120),
        size: Math.max(0, Number(pf.size) || 0),
        storageKey: sanitizePlain(pf.storageKey || pf.fileId),
        isPreview: Boolean(pf.isPreview),
      }));
    }

    if (input.status !== undefined && ['draft', 'published', 'archived'].includes(input.status)) {
      post.status = input.status;
    }

    await post.save();
    return post;
  }

  static async deletePost(
    userId: string,
    postId: string,
    isAdmin = false,
  ): Promise<{ deleted: boolean }> {
    const post = await LearningPost.findById(new Types.ObjectId(postId));
    if (!post) throw new Error('Post not found');

    if (!isAdmin && String(post.authorId) !== String(userId)) {
      throw new Error('Unauthorized to delete this post');
    }

    // If paid purchases exist and non-admin tries to hard-delete, archive instead so buyers keep access
    const existingPurchasesCount = await LearningPurchase.countDocuments({
      postId: post._id,
      status: 'succeeded',
    });
    if (existingPurchasesCount > 0 && !isAdmin) {
      post.status = 'archived';
      await post.save();
      return { deleted: true };
    }

    await Promise.all([
      LearningPost.deleteOne({ _id: post._id }),
      LearningComment.deleteMany({ postId: post._id }),
      LearningLike.deleteMany({ postId: post._id }),
      LearningBookmark.deleteMany({ postId: post._id }),
    ]);

    return { deleted: true };
  }

  static async listPosts(params: {
    q?: string;
    category?: string;
    tag?: string;
    difficulty?: string;
    contentType?: string;
    pricingType?: string;
    minPrice?: number;
    maxPrice?: number;
    authorId?: string;
    sort?: string;
    page?: number;
    limit?: number;
    viewerUserId?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { status: 'published' };

    if (params.category && params.category !== 'All') {
      query.category = params.category;
    }
    if (params.tag) {
      query.tags = params.tag.toLowerCase();
    }
    if (params.difficulty && ['beginner', 'intermediate', 'advanced'].includes(params.difficulty)) {
      query.difficulty = params.difficulty;
    }
    if (
      params.contentType &&
      params.contentType !== 'All' &&
      LEARNING_CONTENT_TYPES.includes(params.contentType as LearningContentType)
    ) {
      query.contentType = params.contentType;
    }
    if (params.pricingType && ['free', 'paid'].includes(params.pricingType)) {
      query.pricingType = params.pricingType;
    }
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      query.price = {};
      if (params.minPrice !== undefined && Number.isFinite(params.minPrice)) {
        query.price.$gte = params.minPrice;
      }
      if (params.maxPrice !== undefined && Number.isFinite(params.maxPrice)) {
        query.price.$lte = params.maxPrice;
      }
    }
    if (params.authorId && Types.ObjectId.isValid(params.authorId)) {
      query.authorId = new Types.ObjectId(params.authorId);
    }
    if (params.q && params.q.trim()) {
      const qRegex = { $regex: params.q.trim(), $options: 'i' };
      query.$or = [
        { title: qRegex },
        { excerpt: qRegex },
        { category: qRegex },
        { tags: qRegex },
        { authorName: qRegex },
      ];
    }

    let sortSpec: Record<string, 1 | -1> = { isFeatured: -1, createdAt: -1 };
    if (params.sort === 'popular') {
      sortSpec = { enrollmentCount: -1, likesCount: -1, viewsCount: -1, createdAt: -1 };
    } else if (params.sort === 'highest_rated') {
      sortSpec = { averageRating: -1, reviewCount: -1, likesCount: -1, createdAt: -1 };
    } else if (params.sort === 'discussed') {
      sortSpec = { commentsCount: -1, createdAt: -1 };
    } else if (params.sort === 'newest') {
      sortSpec = { createdAt: -1 };
    } else if (params.sort === 'price_asc') {
      sortSpec = { price: 1, createdAt: -1 };
    } else if (params.sort === 'price_desc') {
      sortSpec = { price: -1, createdAt: -1 };
    }

    const [items, total, featured] = await Promise.all([
      LearningPost.find(query)
        .select(
          '-content -chapters.lessons.content -steps.content -codeSnippets.code -protectedFiles.storageKey',
        )
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .lean(),
      LearningPost.countDocuments(query),
      page === 1 && !params.q && !params.category
        ? LearningPost.find({ status: 'published', isFeatured: true })
            .select(
              '-content -chapters.lessons.content -steps.content -codeSnippets.code -protectedFiles.storageKey',
            )
            .sort({ createdAt: -1 })
            .limit(4)
            .lean()
        : Promise.resolve([]),
    ]);

    let likedSet = new Set<string>();
    let bookmarkedSet = new Set<string>();
    const entitledSet = new Set<string>();

    if (params.viewerUserId && Types.ObjectId.isValid(params.viewerUserId)) {
      const viewerObjId = new Types.ObjectId(params.viewerUserId);
      const postIds = items.map((i) => i._id);
      const [likes, bookmarks, entitlements, purchases] = await Promise.all([
        LearningLike.find({
          userId: viewerObjId,
          postId: { $in: postIds },
        }).lean(),
        LearningBookmark.find({
          userId: viewerObjId,
          postId: { $in: postIds },
        }).lean(),
        LearningEntitlement.find({
          userId: viewerObjId,
          postId: { $in: postIds },
          isActive: true,
        }).lean(),
        LearningPurchase.find({
          buyerId: viewerObjId,
          postId: { $in: postIds },
          status: 'succeeded',
        }).lean(),
      ]);
      likedSet = new Set(likes.map((l) => String(l.postId)));
      bookmarkedSet = new Set(bookmarks.map((b) => String(b.postId)));
      for (const e of entitlements) entitledSet.add(String(e.postId));
      for (const p of purchases) entitledSet.add(String(p.postId));
    }

    const enrichedItems = items.map((item) => {
      const isAuthor =
        Boolean(params.viewerUserId) && String(item.authorId) === String(params.viewerUserId);
      const hasAccess =
        item.pricingType !== 'paid' || isAuthor || entitledSet.has(String(item._id));
      return {
        ...item,
        viewerLiked: likedSet.has(String(item._id)),
        viewerBookmarked: bookmarkedSet.has(String(item._id)),
        hasAccess,
      };
    });

    return {
      items: enrichedItems,
      featured,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      categories: LEARNING_CATEGORIES,
      openTopics: OPEN_LEARNING_TOPICS,
      contentTypes: LEARNING_CONTENT_TYPES,
    };
  }

  // --------------------------------------------------------------------------
  // Phase 4: Discovery Overview (Trending Topics, Recommended Creators, Sections)
  // --------------------------------------------------------------------------

  static async getDiscoveryOverview() {
    const summaryProjection =
      '-content -chapters.lessons.content -steps.content -codeSnippets.code -protectedFiles.storageKey';

    const [
      featured,
      recentlyPublished,
      popular,
      highestRated,
      freeLearning,
      paidLearning,
      categoryCounts,
      tagCounts,
      creatorStats,
    ] = await Promise.all([
      LearningPost.find({ status: 'published', isFeatured: true })
        .select(summaryProjection)
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      LearningPost.find({ status: 'published' })
        .select(summaryProjection)
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      LearningPost.find({ status: 'published' })
        .select(summaryProjection)
        .sort({ enrollmentCount: -1, likesCount: -1, viewsCount: -1 })
        .limit(6)
        .lean(),
      LearningPost.find({ status: 'published', reviewCount: { $gt: 0 } })
        .select(summaryProjection)
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(6)
        .lean(),
      LearningPost.find({ status: 'published', pricingType: 'free' })
        .select(summaryProjection)
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      LearningPost.find({ status: 'published', pricingType: 'paid' })
        .select(summaryProjection)
        .sort({ enrollmentCount: -1, averageRating: -1, createdAt: -1 })
        .limit(6)
        .lean(),
      LearningPost.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      LearningPost.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      LearningPost.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: '$authorId',
            authorName: { $first: '$authorName' },
            authorUsername: { $first: '$authorUsername' },
            authorAvatar: { $first: '$authorAvatar' },
            publishedCount: { $sum: 1 },
            totalViews: { $sum: '$viewsCount' },
            totalLikes: { $sum: '$likesCount' },
            totalEnrollments: { $sum: '$enrollmentCount' },
            categories: { $addToSet: '$category' },
          },
        },
        { $sort: { totalEnrollments: -1, totalLikes: -1, publishedCount: -1 } },
        { $limit: 8 },
      ]),
    ]);

    // Enrich recommended creators with CreatorProfile and real approved review ratings
    const creatorIds = creatorStats.map((c) => c._id);
    const [profiles, ratingAgg] = await Promise.all([
      CreatorProfile.find({ userId: { $in: creatorIds } }).lean(),
      LearningReview.aggregate([
        { $match: { creatorId: { $in: creatorIds }, status: 'approved' } },
        {
          $group: {
            _id: '$creatorId',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));
    const ratingMap = new Map(ratingAgg.map((r) => [String(r._id), r]));

    const recommendedCreators = creatorStats.map((c) => {
      const prof = profileMap.get(String(c._id));
      const rat = ratingMap.get(String(c._id));
      return {
        userId: String(c._id),
        displayName: prof?.displayName || c.authorName,
        username: prof?.username || c.authorUsername || String(c._id),
        avatarUrl: prof?.avatarUrl || c.authorAvatar || '',
        headline: prof?.headline || '',
        bio: prof?.bio || '',
        expertise: prof?.expertise?.length ? prof.expertise : c.categories.slice(0, 5),
        followersCount: prof?.followersCount || 0,
        publishedCount: c.publishedCount,
        totalViews: c.totalViews,
        totalLikes: c.totalLikes,
        totalEnrollments: c.totalEnrollments,
        averageRating: rat ? Math.round(rat.averageRating * 10) / 10 : 0,
        reviewCount: rat ? rat.reviewCount : 0,
      };
    });

    return {
      featured,
      recentlyPublished,
      popular,
      highestRated,
      freeLearning,
      paidLearning,
      trendingCategories: categoryCounts.map((c) => ({ category: c._id, count: c.count })),
      trendingTags: tagCounts.map((t) => ({ tag: t._id, count: t.count })),
      recommendedCreators,
      openTopics: OPEN_LEARNING_TOPICS,
    };
  }

  static async getPostBySlug(
    slug: string,
    viewerUserId?: string,
    isAdmin = false,
    skipView = false,
  ) {
    const query: Record<string, any> = { slug: slug.toLowerCase() };
    const shouldIncrement = !skipView && !isAdmin;

    const post = await LearningPost.findOneAndUpdate(
      query,
      shouldIncrement ? { $inc: { viewsCount: 1 } } : {},
      { new: true },
    ).lean();

    if (!post) throw new Error('Post not found');

    const isAuthor = Boolean(viewerUserId) && String(post.authorId) === String(viewerUserId);
    if (shouldIncrement && isAuthor) {
      await LearningPost.updateOne({ _id: post._id }, { $inc: { viewsCount: -1 } }).catch(() => {});
      if (typeof post.viewsCount === 'number') {
        post.viewsCount = Math.max(0, post.viewsCount - 1);
      }
    }

    // Allow author or admin to view draft/archived/hidden posts, plus entitled buyers to access archived posts
    const entitlementCheck = await this.checkUserEntitlement(post, viewerUserId, isAdmin);
    if (
      post.status !== 'published' &&
      !isAuthor &&
      !isAdmin &&
      !(post.status === 'archived' && entitlementCheck.hasAccess)
    ) {
      throw new Error('Post not found');
    }

    let viewerLiked = false;
    let viewerBookmarked = false;
    let progressDoc: any = null;

    if (viewerUserId && Types.ObjectId.isValid(viewerUserId)) {
      const viewerObjId = new Types.ObjectId(viewerUserId);
      const [like, bookmark, prog] = await Promise.all([
        LearningLike.findOne({
          userId: viewerObjId,
          postId: post._id,
        }).lean(),
        LearningBookmark.findOne({
          userId: viewerObjId,
          postId: post._id,
        }).lean(),
        LearningProgress.findOneAndUpdate(
          { userId: viewerObjId, postId: post._id },
          { $set: { lastViewedAt: new Date() } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        ).lean(),
      ]);
      viewerLiked = Boolean(like);
      viewerBookmarked = Boolean(bookmark);
      progressDoc = prog;
    }

    const related = await LearningPost.find({
      status: 'published',
      category: post.category,
      _id: { $ne: post._id },
    })
      .select(
        'title slug excerpt category difficulty readTimeMinutes likesCount commentsCount authorName createdAt pricingType price currency contentType averageRating reviewCount',
      )
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(3)
      .lean();

    const safePost = this.redactPostForViewer(
      post,
      entitlementCheck.hasAccess,
      entitlementCheck.accessReason,
    );

    return {
      ...safePost,
      viewerLiked,
      viewerBookmarked,
      viewerProgress: progressDoc
        ? {
            isSavedToLibrary: progressDoc.isSavedToLibrary,
            completedLessonIds: progressDoc.completedLessonIds || [],
            progressPercent: progressDoc.progressPercent || 0,
            isCompleted: Boolean(progressDoc.isCompleted),
          }
        : null,
      related,
    };
  }

  // --------------------------------------------------------------------------
  // Likes & Bookmarks (Phase 9)
  // --------------------------------------------------------------------------

  static async togglePostLike(
    userId: string,
    postId: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const post = await LearningPost.findById(new Types.ObjectId(postId));
    if (!post || post.status !== 'published') throw new Error('Post not found');

    const userObjId = new Types.ObjectId(userId);
    const existing = await LearningLike.findOne({
      userId: userObjId,
      postId: post._id,
    });

    if (existing) {
      await LearningLike.deleteOne({ _id: existing._id });
    } else {
      await LearningLike.create({
        userId: userObjId,
        postId: post._id,
      });
    }

    const likesCount = await LearningLike.countDocuments({
      postId: post._id,
    });
    post.likesCount = likesCount;
    await post.save();

    return { liked: !existing, likesCount };
  }

  static async toggleBookmark(
    userId: string,
    postId: string,
  ): Promise<{ bookmarked: boolean; bookmarksCount: number }> {
    const post = await LearningPost.findById(new Types.ObjectId(postId));
    if (!post || post.status !== 'published') throw new Error('Post not found');

    const userObjId = new Types.ObjectId(userId);
    const existing = await LearningBookmark.findOne({
      userId: userObjId,
      postId: post._id,
    });

    if (existing) {
      await LearningBookmark.deleteOne({ _id: existing._id });
    } else {
      await LearningBookmark.create({
        userId: userObjId,
        postId: post._id,
      });
    }

    const bookmarksCount = await LearningBookmark.countDocuments({ postId: post._id });
    post.bookmarksCount = bookmarksCount;
    await post.save();

    return { bookmarked: !existing, bookmarksCount };
  }

  static async getUserBookmarks(userId: string) {
    const bookmarks = await LearningBookmark.find({
      userId: new Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .lean();

    const postIds = bookmarks.map((b) => b.postId);
    const posts = await LearningPost.find({
      _id: { $in: postIds },
      status: 'published',
    })
      .select(
        '-content -chapters.lessons.content -steps.content -codeSnippets.code -protectedFiles.storageKey',
      )
      .lean();

    return posts.map((p) => ({
      ...p,
      viewerBookmarked: true,
    }));
  }

  // --------------------------------------------------------------------------
  // Comments & Replies (Phase 9)
  // --------------------------------------------------------------------------

  static async getPostComments(postId: string) {
    if (!Types.ObjectId.isValid(postId)) throw new Error('Invalid post ID');
    const comments = await LearningComment.find({
      postId: new Types.ObjectId(postId),
      status: 'active',
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    return comments;
  }

  static async addComment(
    userId: string,
    postId: string,
    content: string,
    parentCommentId?: string | null,
  ) {
    const user = await User.findById(new Types.ObjectId(userId));
    if (!user) throw new Error('User not found');
    if (user.isSuspended) throw new Error('Your account is currently suspended');

    const post = await LearningPost.findById(new Types.ObjectId(postId));
    if (!post || post.status !== 'published') throw new Error('Post not found');

    const cleanContent = sanitizePlain(content).slice(0, 2500);
    if (!cleanContent) throw new Error('Comment cannot be empty');

    let parentObjId: Types.ObjectId | null = null;
    if (parentCommentId && Types.ObjectId.isValid(parentCommentId)) {
      const parent = await LearningComment.findById(new Types.ObjectId(parentCommentId));
      if (parent && String(parent.postId) === String(post._id)) {
        parentObjId = parent._id as Types.ObjectId;
      }
    }

    const devProfile = await DeveloperProfile.findOne({
      userId: new Types.ObjectId(userId),
    }).lean();

    const comment = await LearningComment.create({
      postId: post._id,
      authorId: new Types.ObjectId(userId),
      authorName: devProfile?.displayName || user.name,
      authorAvatar: devProfile?.profileImage || user.avatarUrl || '',
      parentCommentId: parentObjId,
      content: cleanContent,
    });

    post.commentsCount = await LearningComment.countDocuments({
      postId: post._id,
      status: 'active',
    });
    await post.save();

    return comment;
  }

  static async updateComment(userId: string, commentId: string, content: string) {
    const comment = await LearningComment.findById(new Types.ObjectId(commentId));
    if (!comment || comment.status !== 'active') throw new Error('Comment not found');
    if (String(comment.authorId) !== String(userId)) {
      throw new Error('Unauthorized to edit this comment');
    }

    const cleanContent = sanitizePlain(content).slice(0, 2500);
    if (!cleanContent) throw new Error('Comment cannot be empty');

    comment.content = cleanContent;
    await comment.save();
    return comment;
  }

  static async deleteComment(userId: string, commentId: string, isAdmin = false) {
    const comment = await LearningComment.findById(new Types.ObjectId(commentId));
    if (!comment) throw new Error('Comment not found');

    if (!isAdmin && String(comment.authorId) !== String(userId)) {
      throw new Error('Unauthorized to delete this comment');
    }

    const postId = comment.postId;
    await LearningComment.deleteMany({
      $or: [{ _id: comment._id }, { parentCommentId: comment._id }],
    });

    const remaining = await LearningComment.countDocuments({
      postId,
      status: 'active',
    });
    await LearningPost.updateOne({ _id: postId }, { $set: { commentsCount: remaining } });

    return { deleted: true, commentsCount: remaining };
  }

  // --------------------------------------------------------------------------
  // Phase 8: Ratings & Reviews (Dedicated 1-5 Star Reviews Separate From Comments)
  // --------------------------------------------------------------------------

  static async recalculatePostRating(postId: Types.ObjectId): Promise<{
    averageRating: number;
    reviewCount: number;
  }> {
    const stats = await LearningReview.aggregate([
      { $match: { postId, status: 'approved' } },
      {
        $group: {
          _id: '$postId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageRating = stats[0] ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const reviewCount = stats[0] ? stats[0].count : 0;

    await LearningPost.updateOne({ _id: postId }, { $set: { averageRating, reviewCount } });

    return { averageRating, reviewCount };
  }

  static async listReviews(postId: string, page = 1, limit = 20) {
    if (!Types.ObjectId.isValid(postId)) throw new Error('Invalid post ID');
    const postObjId = new Types.ObjectId(postId);
    const skip = (Math.max(1, page) - 1) * limit;

    const [reviews, total, distributionAgg] = await Promise.all([
      LearningReview.find({ postId: postObjId, status: 'approved' })
        .sort({ isVerifiedPurchase: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LearningReview.countDocuments({ postId: postObjId, status: 'approved' }),
      LearningReview.aggregate([
        { $match: { postId: postObjId, status: 'approved' } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
      ]),
    ]);

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let weightedSum = 0;
    for (const row of distributionAgg) {
      const r = Number(row._id);
      if (r >= 1 && r <= 5) {
        distribution[r] = row.count;
        weightedSum += r * row.count;
      }
    }
    const averageRating = total > 0 ? Math.round((weightedSum / total) * 10) / 10 : 0;

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      summary: {
        averageRating,
        totalApproved: total,
        distribution,
      },
    };
  }

  static async upsertReview(
    userId: string,
    postId: string,
    input: { rating: number; comment: string },
  ) {
    if (!Types.ObjectId.isValid(postId)) throw new Error('Invalid post ID');
    const user = await User.findById(new Types.ObjectId(userId));
    if (!user) throw new Error('User not found');
    if (user.isSuspended) throw new Error('Your account is currently suspended');

    const post = await LearningPost.findById(new Types.ObjectId(postId));
    if (!post || post.status !== 'published') throw new Error('Learning material not found');

    if (String(post.authorId) === String(userId)) {
      throw new Error('Creators cannot review their own learning material.');
    }

    const rating = Math.round(Number(input.rating));
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars.');
    }

    const comment = sanitizePlain(input.comment).slice(0, 2500);
    if (comment.length < 3) {
      throw new Error('Review comment must be at least 3 characters.');
    }

    const userObjId = new Types.ObjectId(userId);
    const verifiedPurchase = await LearningPurchase.findOne({
      buyerId: userObjId,
      postId: post._id,
      status: 'succeeded',
    }).lean();

    const entitlement = await this.checkUserEntitlement(post, userId, false);
    if (post.pricingType === 'paid' && !entitlement.hasAccess) {
      throw new Error('Only learners who have purchased this paid material can submit a review.');
    }

    const review = await LearningReview.findOneAndUpdate(
      { postId: post._id, userId: userObjId },
      {
        $set: {
          creatorId: post.authorId,
          userName: user.name,
          userAvatar: user.avatarUrl || '',
          rating,
          comment,
          isVerifiedPurchase: Boolean(verifiedPurchase),
          status: 'approved',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const ratingSummary = await this.recalculatePostRating(post._id as Types.ObjectId);

    return {
      review,
      ...ratingSummary,
    };
  }

  static async deleteReview(userId: string, reviewId: string, isAdmin = false) {
    if (!Types.ObjectId.isValid(reviewId)) throw new Error('Invalid review ID');
    const review = await LearningReview.findById(new Types.ObjectId(reviewId));
    if (!review) throw new Error('Review not found');

    if (!isAdmin && String(review.userId) !== String(userId)) {
      throw new Error('Unauthorized to delete this review');
    }

    const postId = review.postId;
    await LearningReview.deleteOne({ _id: review._id });
    const summary = await this.recalculatePostRating(postId);

    return { deleted: true, ...summary };
  }

  // --------------------------------------------------------------------------
  // Phase 5 & 9: Creator Profiles & Following
  // --------------------------------------------------------------------------

  static async getCreatorProfile(usernameOrUserId: string, viewerUserId?: string) {
    let profile = await CreatorProfile.findOne({
      username: usernameOrUserId.toLowerCase(),
    }).lean();

    let userIdObj: Types.ObjectId | null = profile ? profile.userId : null;

    if (!userIdObj && Types.ObjectId.isValid(usernameOrUserId)) {
      userIdObj = new Types.ObjectId(usernameOrUserId);
      profile = await CreatorProfile.findOne({ userId: userIdObj }).lean();
    }

    if (!userIdObj) {
      const devProf = await DeveloperProfile.findOne({
        username: usernameOrUserId.toLowerCase(),
      }).lean();
      if (devProf) {
        userIdObj = devProf.userId;
      }
    }

    if (!userIdObj) {
      throw new Error('Creator profile not found');
    }

    const [user, devProfile, publishedPosts, reviewStats, verifiedSalesCount, followerCount] =
      await Promise.all([
        User.findById(userIdObj).select('name avatar bio createdAt').lean(),
        DeveloperProfile.findOne({ userId: userIdObj }).lean(),
        LearningPost.find({ authorId: userIdObj, status: 'published' })
          .select(
            '-content -chapters.lessons.content -steps.content -codeSnippets.code -protectedFiles.storageKey',
          )
          .sort({ isFeatured: -1, createdAt: -1 })
          .lean(),
        LearningReview.aggregate([
          { $match: { creatorId: userIdObj, status: 'approved' } },
          {
            $group: {
              _id: '$creatorId',
              averageRating: { $avg: '$rating' },
              reviewCount: { $sum: 1 },
              verifiedReviewsCount: {
                $sum: { $cond: ['$isVerifiedPurchase', 1, 0] },
              },
            },
          },
        ]),
        LearningPurchase.countDocuments({
          creatorId: userIdObj,
          status: 'succeeded',
        }),
        CreatorFollow.countDocuments({ creatorId: userIdObj }),
      ]);

    if (!user) throw new Error('Creator user account not found');

    let viewerFollowing = false;
    if (viewerUserId && Types.ObjectId.isValid(viewerUserId)) {
      const followDoc = await CreatorFollow.findOne({
        followerId: new Types.ObjectId(viewerUserId),
        creatorId: userIdObj,
      }).lean();
      viewerFollowing = Boolean(followDoc);
    }

    const recentFeedback = await LearningReview.find({
      creatorId: userIdObj,
      status: 'approved',
    })
      .sort({ isVerifiedPurchase: -1, createdAt: -1 })
      .limit(10)
      .lean();

    const freeMaterials = publishedPosts.filter((p) => p.pricingType !== 'paid');
    const paidMaterials = publishedPosts.filter((p) => p.pricingType === 'paid');

    const derivedExpertise = Array.from(
      new Set(publishedPosts.map((p) => p.category).filter(Boolean)),
    );

    const ratingInfo = reviewStats[0];

    return {
      userId: String(userIdObj),
      username:
        profile?.username ||
        devProfile?.username ||
        user.name.toLowerCase().replace(/[^a-z0-9]+/g, '') ||
        String(userIdObj),
      displayName: profile?.displayName || devProfile?.displayName || user.name,
      avatarUrl: profile?.avatarUrl || devProfile?.profileImage || user.avatarUrl || '',
      bio: profile?.bio || devProfile?.biography || user.bio || '',
      headline: profile?.headline || devProfile?.headline || 'Knowledge Creator on VexoraMods',
      expertise: profile?.expertise?.length
        ? profile.expertise
        : devProfile?.skills?.length
          ? devProfile.skills
          : derivedExpertise,
      interests: profile?.interests || [],
      websiteUrl: profile?.websiteUrl || devProfile?.portfolioUrl || '',
      followersCount: followerCount,
      viewerFollowing,
      stats: {
        totalPublished: publishedPosts.length,
        freeCount: freeMaterials.length,
        paidCount: paidMaterials.length,
        averageRating: ratingInfo ? Math.round(ratingInfo.averageRating * 10) / 10 : 0,
        reviewCount: ratingInfo ? ratingInfo.reviewCount : 0,
        verifiedReviewsCount: ratingInfo ? ratingInfo.verifiedReviewsCount : 0,
        verifiedPurchasesCount: verifiedSalesCount,
      },
      publishedMaterials: publishedPosts,
      freeMaterials,
      paidMaterials,
      recentFeedback,
    };
  }

  static async updateCreatorProfile(
    userId: string,
    input: {
      displayName?: string;
      username?: string;
      avatarUrl?: string;
      bio?: string;
      headline?: string;
      expertise?: string[];
      interests?: string[];
      websiteUrl?: string;
      payoutMethod?: 'bank_transfer' | 'gcash' | 'paypal' | 'stripe_connect' | '';
      payoutAccountInfo?: string;
    },
  ) {
    const userObjId = new Types.ObjectId(userId);
    const user = await User.findById(userObjId);
    if (!user) throw new Error('User not found');

    const existing = await CreatorProfile.findOne({ userId: userObjId });
    let username = existing?.username || '';
    if (input.username !== undefined) {
      const cleanedUsername = sanitizePlain(input.username)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 40);
      if (cleanedUsername.length < 3) {
        throw new Error('Creator username must be at least 3 characters');
      }
      const conflict = await CreatorProfile.findOne({
        username: cleanedUsername,
        userId: { $ne: userObjId },
      });
      if (conflict) {
        throw new Error('This username is already taken by another creator');
      }
      username = cleanedUsername;
    } else if (!username) {
      username = `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'creator'}_${userObjId
        .toString()
        .slice(-5)}`;
    }

    const updateFields: Record<string, any> = {
      username,
      displayName:
        input.displayName !== undefined
          ? sanitizePlain(input.displayName).slice(0, 100) || user.name
          : existing?.displayName || user.name,
    };

    if (input.avatarUrl !== undefined) {
      updateFields.avatarUrl = input.avatarUrl ? sanitizeUrl(input.avatarUrl) : '';
    }
    if (input.bio !== undefined) {
      updateFields.bio = sanitizePlain(input.bio).slice(0, 1200);
    }
    if (input.headline !== undefined) {
      updateFields.headline = sanitizePlain(input.headline).slice(0, 160);
    }
    if (input.expertise !== undefined) {
      updateFields.expertise = input.expertise
        .map((e) => sanitizePlain(e).slice(0, 60))
        .filter(Boolean)
        .slice(0, 20);
    }
    if (input.interests !== undefined) {
      updateFields.interests = input.interests
        .map((i) => sanitizePlain(i).slice(0, 60))
        .filter(Boolean)
        .slice(0, 20);
    }
    if (input.websiteUrl !== undefined) {
      updateFields.websiteUrl = input.websiteUrl ? sanitizeUrl(input.websiteUrl) : '';
    }
    if (
      input.payoutMethod !== undefined &&
      ['bank_transfer', 'gcash', 'paypal', 'stripe_connect', ''].includes(input.payoutMethod)
    ) {
      updateFields.payoutMethod = input.payoutMethod;
    }
    if (input.payoutAccountInfo !== undefined) {
      updateFields.payoutAccountInfo = sanitizePlain(input.payoutAccountInfo).slice(0, 500);
    }

    const updated = await CreatorProfile.findOneAndUpdate(
      { userId: userObjId },
      { $set: updateFields },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return updated;
  }

  static async toggleFollowCreator(followerUserId: string, creatorUserId: string) {
    if (String(followerUserId) === String(creatorUserId)) {
      throw new Error('You cannot follow your own creator profile');
    }
    if (!Types.ObjectId.isValid(creatorUserId)) {
      throw new Error('Invalid creator user ID');
    }

    const followerObjId = new Types.ObjectId(followerUserId);
    const creatorObjId = new Types.ObjectId(creatorUserId);

    const existing = await CreatorFollow.findOne({
      followerId: followerObjId,
      creatorId: creatorObjId,
    });

    if (existing) {
      await CreatorFollow.deleteOne({ _id: existing._id });
    } else {
      await CreatorFollow.create({
        followerId: followerObjId,
        creatorId: creatorObjId,
      });
    }

    const followersCount = await CreatorFollow.countDocuments({ creatorId: creatorObjId });
    await CreatorProfile.updateOne({ userId: creatorObjId }, { $set: { followersCount } });

    return { following: !existing, followersCount };
  }

  // --------------------------------------------------------------------------
  // Phase 10: Payment & Purchase System (Checkout, Webhooks, Entitlements, Refunds)
  // --------------------------------------------------------------------------

  static calculateEarningsSplit(amount: number): {
    amount: number;
    platformFee: number;
    processingFee: number;
    creatorNetEarnings: number;
  } {
    const cleanAmount = Math.round(Number(amount) * 100) / 100;
    const platformFee =
      Math.round(cleanAmount * (env.LEARNING_PLATFORM_FEE_PERCENT / 100) * 100) / 100;
    const processingFee =
      Math.round(cleanAmount * (env.LEARNING_PROCESSING_FEE_PERCENT / 100) * 100) / 100;
    const creatorNetEarnings = Math.max(
      0,
      Math.round((cleanAmount - platformFee - processingFee) * 100) / 100,
    );

    return {
      amount: cleanAmount,
      platformFee,
      processingFee,
      creatorNetEarnings,
    };
  }

  static async createPurchaseCheckout(
    buyerUserId: string,
    postId: string,
    options?: { paymentProvider?: 'paymongo' | 'stripe' | 'sandbox' },
  ) {
    if (!Types.ObjectId.isValid(postId)) throw new Error('Invalid content ID');
    const buyer = await User.findById(new Types.ObjectId(buyerUserId));
    if (!buyer) throw new Error('Buyer account not found');
    if (buyer.isSuspended) throw new Error('Your account is currently suspended');

    const post = await LearningPost.findById(new Types.ObjectId(postId));
    if (!post || post.status !== 'published') {
      throw new Error('Learning material not found or not available for purchase');
    }

    if (post.pricingType !== 'paid' || post.price <= 0) {
      throw new Error('This learning material is FREE and does not require purchase.');
    }

    if (String(post.authorId) === String(buyerUserId)) {
      throw new Error('You cannot purchase your own learning material.');
    }

    const existingEntitlement = await this.checkUserEntitlement(post, buyerUserId, false);
    if (existingEntitlement.hasAccess) {
      throw new Error('You already own access to this learning material.');
    }

    const provider =
      options?.paymentProvider ||
      (['stripe', 'paymongo', 'sandbox'].includes(env.PAYMENT_PROVIDER)
        ? (env.PAYMENT_PROVIDER as 'stripe' | 'paymongo' | 'sandbox')
        : 'sandbox');

    const split = this.calculateEarningsSplit(post.price);
    const providerSessionId = `cs_learn_${provider}_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`;

    const purchase = await LearningPurchase.create({
      buyerId: new Types.ObjectId(buyerUserId),
      postId: post._id,
      creatorId: post.authorId,
      amount: split.amount,
      currency: post.currency || 'PHP',
      platformFee: split.platformFee,
      processingFee: split.processingFee,
      creatorNetEarnings: split.creatorNetEarnings,
      paymentProvider: provider,
      providerSessionId,
      status: 'pending',
    });

    const checkoutUrl = `${env.CLIENT_URL}/learning/${post.slug}?checkoutSession=${providerSessionId}&purchaseId=${purchase._id}`;

    return {
      purchaseId: String(purchase._id),
      providerSessionId,
      paymentProvider: provider,
      amount: split.amount,
      currency: post.currency || 'PHP',
      status: purchase.status,
      checkoutUrl,
      requiresWebhookVerification: true,
    };
  }

  static async completeVerifiedPurchase(
    purchaseIdOrSessionId: string,
    providerPaymentId?: string,
  ): Promise<typeof LearningPurchase.prototype> {
    const query = Types.ObjectId.isValid(purchaseIdOrSessionId)
      ? {
          $or: [
            { _id: new Types.ObjectId(purchaseIdOrSessionId) },
            { providerSessionId: purchaseIdOrSessionId },
          ],
        }
      : { providerSessionId: purchaseIdOrSessionId };

    const purchase = await LearningPurchase.findOne(query);
    if (!purchase) {
      throw new Error('Purchase record not found');
    }

    // Idempotent check: if already succeeded, ensure entitlement exists and return
    if (purchase.status === 'succeeded') {
      await LearningEntitlement.findOneAndUpdate(
        { userId: purchase.buyerId, postId: purchase.postId },
        {
          $set: {
            source: 'purchase',
            purchaseId: purchase._id as Types.ObjectId,
            isActive: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      return purchase;
    }

    purchase.status = 'succeeded';
    purchase.verifiedAt = new Date();
    if (providerPaymentId) {
      purchase.providerPaymentId = providerPaymentId;
    }
    await purchase.save();

    await Promise.all([
      LearningEntitlement.findOneAndUpdate(
        { userId: purchase.buyerId, postId: purchase.postId },
        {
          $set: {
            source: 'purchase',
            purchaseId: purchase._id as Types.ObjectId,
            isActive: true,
            grantedAt: new Date(),
          },
          $unset: { revokedAt: 1, revokeReason: 1 },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
      LearningProgress.findOneAndUpdate(
        { userId: purchase.buyerId, postId: purchase.postId },
        {
          $set: {
            isSavedToLibrary: true,
            lastViewedAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
      LearningPost.updateOne({ _id: purchase.postId }, { $inc: { enrollmentCount: 1 } }),
    ]);

    return purchase;
  }

  static async refundPurchase(
    purchaseId: string,
    actorUserId: string,
    isAdmin = false,
    reason = 'Buyer refund processed',
  ) {
    if (!Types.ObjectId.isValid(purchaseId)) throw new Error('Invalid purchase ID');
    const purchase = await LearningPurchase.findById(new Types.ObjectId(purchaseId));
    if (!purchase) throw new Error('Purchase not found');

    if (!isAdmin && String(purchase.creatorId) !== String(actorUserId)) {
      throw new Error('Only an administrator or the content creator can issue a refund.');
    }

    if (purchase.status === 'refunded') {
      return purchase;
    }

    const wasSucceeded = purchase.status === 'succeeded';
    purchase.status = 'refunded';
    purchase.refundedAt = new Date();
    purchase.refundReason = sanitizePlain(reason).slice(0, 500);
    await purchase.save();

    // Revoke buyer entitlement upon refund
    await LearningEntitlement.updateOne(
      { userId: purchase.buyerId, postId: purchase.postId, source: 'purchase' },
      {
        $set: {
          isActive: false,
          revokedAt: new Date(),
          revokeReason: purchase.refundReason || 'Purchase refunded',
        },
      },
    );

    if (wasSucceeded) {
      await LearningPost.updateOne(
        { _id: purchase.postId, enrollmentCount: { $gt: 0 } },
        { $inc: { enrollmentCount: -1 } },
      );
    }

    return purchase;
  }

  static verifyWebhookSignature(
    provider: 'paymongo' | 'stripe' | 'sandbox',
    rawBody: string,
    signatureHeader: string,
  ): boolean {
    if (!signatureHeader) return false;
    const secret =
      provider === 'paymongo'
        ? env.PAYMONGO_WEBHOOK_SECRET || env.JWT_SECRET
        : provider === 'stripe'
          ? env.STRIPE_WEBHOOK_SECRET || env.JWT_SECRET
          : env.JWT_SECRET;

    const expectedHmac = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signatureHeader, 'utf8'),
        Buffer.from(expectedHmac, 'utf8'),
      );
    } catch {
      return false;
    }
  }

  static async handleLearningPaymentWebhook(params: {
    provider: 'paymongo' | 'stripe' | 'sandbox';
    rawBody: string;
    signatureHeader: string;
    payload: {
      eventId: string;
      eventType: 'payment.paid' | 'payment.failed' | 'payment.refunded';
      providerSessionId?: string;
      purchaseId?: string;
      providerPaymentId?: string;
      refundReason?: string;
    };
  }) {
    const isValidSig = this.verifyWebhookSignature(
      params.provider,
      params.rawBody,
      params.signatureHeader,
    );
    if (!isValidSig) {
      throw new Error('Invalid webhook signature');
    }

    const eventId = sanitizePlain(params.payload.eventId);
    if (!eventId) {
      throw new Error('Missing webhook eventId');
    }

    // Idempotency guard via WebhookEvent collection
    const existingEvent = await WebhookEvent.findOne({ eventId }).lean();
    if (existingEvent && existingEvent.processingStatus === 'processed') {
      return { duplicate: true, eventId };
    }

    const webhookDoc = await WebhookEvent.findOneAndUpdate(
      { eventId },
      {
        $setOnInsert: {
          provider: params.provider,
          eventId,
          eventType: params.payload.eventType,
          processingStatus: 'received',
          receivedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    const lookupId = params.payload.purchaseId || params.payload.providerSessionId || '';
    if (!lookupId) {
      throw new Error('Webhook payload missing purchaseId or providerSessionId');
    }

    if (params.payload.eventType === 'payment.paid') {
      const purchase = await this.completeVerifiedPurchase(
        lookupId,
        params.payload.providerPaymentId,
      );
      webhookDoc.processingStatus = 'processed';
      webhookDoc.processedAt = new Date();
      await webhookDoc.save();
      return { duplicate: false, status: 'succeeded', purchaseId: String(purchase._id) };
    }

    if (params.payload.eventType === 'payment.failed') {
      const query = Types.ObjectId.isValid(lookupId)
        ? { $or: [{ _id: new Types.ObjectId(lookupId) }, { providerSessionId: lookupId }] }
        : { providerSessionId: lookupId };
      const purchase = await LearningPurchase.findOneAndUpdate(
        query,
        { $set: { status: 'failed' } },
        { new: true },
      );
      webhookDoc.processingStatus = 'processed';
      webhookDoc.processedAt = new Date();
      await webhookDoc.save();
      return {
        duplicate: false,
        status: 'failed',
        purchaseId: purchase ? String(purchase._id) : null,
      };
    }

    if (params.payload.eventType === 'payment.refunded') {
      const query = Types.ObjectId.isValid(lookupId)
        ? { $or: [{ _id: new Types.ObjectId(lookupId) }, { providerSessionId: lookupId }] }
        : { providerSessionId: lookupId };
      const target = await LearningPurchase.findOne(query);
      if (!target) throw new Error('Purchase not found for refund webhook');
      const refunded = await this.refundPurchase(
        String(target._id),
        String(target.creatorId),
        true,
        params.payload.refundReason || 'Provider webhook refund',
      );
      webhookDoc.processingStatus = 'processed';
      webhookDoc.processedAt = new Date();
      await webhookDoc.save();
      return { duplicate: false, status: 'refunded', purchaseId: String(refunded._id) };
    }

    throw new Error(`Unsupported webhook eventType: ${params.payload.eventType}`);
  }

  static async verifySandboxPurchaseForDev(buyerUserId: string, purchaseId: string) {
    if (env.NODE_ENV === 'production') {
      throw new Error('Sandbox purchase verification is disabled in production.');
    }
    if (!Types.ObjectId.isValid(purchaseId)) {
      throw new Error('Invalid purchase ID');
    }
    const purchase = await LearningPurchase.findById(new Types.ObjectId(purchaseId));
    if (!purchase) throw new Error('Purchase not found');
    if (String(purchase.buyerId) !== String(buyerUserId)) {
      throw new Error('Unauthorized buyer for this purchase');
    }
    if (purchase.paymentProvider !== 'sandbox') {
      throw new Error('Only sandbox provider sessions can use sandbox verification');
    }

    return this.completeVerifiedPurchase(String(purchase._id), `pay_sandbox_${Date.now()}`);
  }

  // --------------------------------------------------------------------------
  // Phase 6 & 11: Creator Dashboard, Earnings & Payouts
  // --------------------------------------------------------------------------

  static async getCreatorDashboard(creatorUserId: string) {
    const creatorObjId = new Types.ObjectId(creatorUserId);

    const [allPosts, purchases, payouts, creatorProfile] = await Promise.all([
      LearningPost.find({ authorId: creatorObjId })
        .select(
          '-content -chapters.lessons.content -steps.content -codeSnippets.code -protectedFiles.storageKey',
        )
        .sort({ createdAt: -1 })
        .lean(),
      LearningPurchase.find({ creatorId: creatorObjId })
        .populate('postId', 'title slug pricingType price')
        .populate('buyerId', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      CreatorPayout.find({ creatorId: creatorObjId }).sort({ createdAt: -1 }).lean(),
      CreatorProfile.findOne({ userId: creatorObjId }).lean(),
    ]);

    const publishedMaterials = allPosts.filter((p) => p.status === 'published');
    const drafts = allPosts.filter((p) => p.status === 'draft');
    const archivedMaterials = allPosts.filter((p) => p.status === 'archived');
    const freeMaterials = allPosts.filter((p) => p.pricingType !== 'paid');
    const paidMaterials = allPosts.filter((p) => p.pricingType === 'paid');

    const totalViews = allPosts.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
    const totalLikes = allPosts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
    const totalEnrollments = allPosts.reduce((sum, p) => sum + (p.enrollmentCount || 0), 0);

    const succeededPurchases = purchases.filter((p) => p.status === 'succeeded');
    const refundedPurchases = purchases.filter((p) => p.status === 'refunded');

    const grossSales =
      Math.round(succeededPurchases.reduce((sum, p) => sum + (p.amount || 0), 0) * 100) / 100;
    const platformFees =
      Math.round(succeededPurchases.reduce((sum, p) => sum + (p.platformFee || 0), 0) * 100) / 100;
    const processingFees =
      Math.round(succeededPurchases.reduce((sum, p) => sum + (p.processingFee || 0), 0) * 100) /
      100;
    const netCreatorEarnings =
      Math.round(
        succeededPurchases.reduce((sum, p) => sum + (p.creatorNetEarnings || 0), 0) * 100,
      ) / 100;
    const refundedAmount =
      Math.round(refundedPurchases.reduce((sum, p) => sum + (p.amount || 0), 0) * 100) / 100;

    const paidPayoutsTotal =
      Math.round(
        payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0) *
          100,
      ) / 100;

    const pendingPayoutsTotal =
      Math.round(
        payouts
          .filter((p) => p.status === 'pending' || p.status === 'approved')
          .reduce((sum, p) => sum + (p.amount || 0), 0) * 100,
      ) / 100;

    // Available balance only counts verified net earnings minus paid and pending/approved payouts
    const availableEarnings = Math.max(
      0,
      Math.round((netCreatorEarnings - paidPayoutsTotal - pendingPayoutsTotal) * 100) / 100,
    );

    // Per-post paid sales breakdown
    const salesByPostMap = new Map<
      string,
      { verifiedSales: number; grossRevenue: number; netRevenue: number; refunds: number }
    >();
    for (const pur of purchases) {
      const pId = String((pur.postId as any)?._id || pur.postId);
      const entry = salesByPostMap.get(pId) || {
        verifiedSales: 0,
        grossRevenue: 0,
        netRevenue: 0,
        refunds: 0,
      };
      if (pur.status === 'succeeded') {
        entry.verifiedSales += 1;
        entry.grossRevenue = Math.round((entry.grossRevenue + pur.amount) * 100) / 100;
        entry.netRevenue = Math.round((entry.netRevenue + pur.creatorNetEarnings) * 100) / 100;
      } else if (pur.status === 'refunded') {
        entry.refunds += 1;
      }
      salesByPostMap.set(pId, entry);
    }

    const freeContentPerformance = freeMaterials.map((p) => ({
      _id: p._id,
      title: p.title,
      slug: p.slug,
      contentType: p.contentType,
      category: p.category,
      status: p.status,
      viewsCount: p.viewsCount,
      likesCount: p.likesCount,
      bookmarksCount: p.bookmarksCount,
      enrollmentCount: p.enrollmentCount,
      averageRating: p.averageRating,
      reviewCount: p.reviewCount,
      createdAt: p.createdAt,
    }));

    const paidContentPerformance = paidMaterials.map((p) => {
      const perf = salesByPostMap.get(String(p._id)) || {
        verifiedSales: 0,
        grossRevenue: 0,
        netRevenue: 0,
        refunds: 0,
      };
      return {
        _id: p._id,
        title: p.title,
        slug: p.slug,
        contentType: p.contentType,
        category: p.category,
        status: p.status,
        price: p.price,
        currency: p.currency,
        viewsCount: p.viewsCount,
        likesCount: p.likesCount,
        averageRating: p.averageRating,
        reviewCount: p.reviewCount,
        verifiedPurchases: perf.verifiedSales,
        grossSales: perf.grossRevenue,
        netEarnings: perf.netRevenue,
        refunds: perf.refunds,
        createdAt: p.createdAt,
      };
    });

    return {
      overview: {
        totalMaterials: allPosts.length,
        totalPublished: publishedMaterials.length,
        totalDrafts: drafts.length,
        totalArchived: archivedMaterials.length,
        freeCount: freeMaterials.length,
        paidCount: paidMaterials.length,
        totalViews,
        totalLikes,
        totalEnrollments,
        verifiedPurchases: succeededPurchases.length,
        grossSales,
        platformFees,
        processingFees,
        platformFeePercent: env.LEARNING_PLATFORM_FEE_PERCENT,
        processingFeePercent: env.LEARNING_PROCESSING_FEE_PERCENT,
        refundsCount: refundedPurchases.length,
        refundedAmount,
        netCreatorEarnings,
        availableEarnings,
        pendingPayouts: pendingPayoutsTotal,
        paidOutTotal: paidPayoutsTotal,
      },
      materials: allPosts,
      drafts,
      freeContentPerformance,
      paidContentPerformance,
      transactions: purchases.slice(0, 50),
      payoutHistory: payouts,
      creatorProfile,
    };
  }

  static async requestPayout(
    creatorUserId: string,
    input: { amount: number; payoutMethod: string; payoutAccountInfo: string },
  ) {
    const dashboard = await this.getCreatorDashboard(creatorUserId);
    const available = dashboard.overview.availableEarnings;

    const amount = Math.round(Number(input.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Payout request amount must be greater than 0.');
    }
    if (amount > available) {
      throw new Error(
        `Requested amount (${amount}) exceeds your available verified balance (${available}).`,
      );
    }

    const payoutMethod = sanitizePlain(input.payoutMethod).slice(0, 80);
    const payoutAccountInfo = sanitizePlain(input.payoutAccountInfo).slice(0, 500);
    if (!payoutMethod || !payoutAccountInfo) {
      throw new Error('Payout method and payout account details are required.');
    }

    const payout = await CreatorPayout.create({
      creatorId: new Types.ObjectId(creatorUserId),
      amount,
      currency: 'PHP',
      payoutMethod,
      payoutAccountInfo,
      status: 'pending',
    });

    return payout;
  }

  static async adminListPayouts(params: { status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (params.status && ['pending', 'approved', 'paid', 'rejected'].includes(params.status)) {
      query.status = params.status;
    }

    const [items, total] = await Promise.all([
      CreatorPayout.find(query)
        .populate('creatorId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CreatorPayout.countDocuments(query),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  static async adminProcessPayout(
    payoutId: string,
    adminUserId: string,
    input: { status: 'approved' | 'paid' | 'rejected'; adminNotes?: string },
  ) {
    if (!Types.ObjectId.isValid(payoutId)) throw new Error('Invalid payout ID');
    const payout = await CreatorPayout.findById(new Types.ObjectId(payoutId));
    if (!payout) throw new Error('Payout request not found');

    if (!['approved', 'paid', 'rejected'].includes(input.status)) {
      throw new Error('Invalid payout status transition');
    }

    payout.status = input.status;
    if (input.adminNotes !== undefined) {
      payout.adminNotes = sanitizePlain(input.adminNotes).slice(0, 500);
    }
    if (Types.ObjectId.isValid(adminUserId)) {
      payout.processedBy = new Types.ObjectId(adminUserId);
    }
    payout.processedAt = new Date();

    await payout.save();
    return payout;
  }

  // --------------------------------------------------------------------------
  // Phase 7: Learner Library & Course Progress Tracking
  // --------------------------------------------------------------------------

  static async saveFreeMaterialToLibrary(userId: string, postId: string) {
    if (!Types.ObjectId.isValid(postId)) throw new Error('Invalid content ID');
    const post = await LearningPost.findById(new Types.ObjectId(postId));
    if (!post || post.status !== 'published') throw new Error('Learning material not found');

    if (post.pricingType === 'paid' && post.price > 0) {
      const access = await this.checkUserEntitlement(post, userId, false);
      if (!access.hasAccess) {
        throw new Error('Purchase required before adding paid content to your library.');
      }
    }

    const userObjId = new Types.ObjectId(userId);
    const existingEntitlement = await LearningEntitlement.findOne({
      userId: userObjId,
      postId: post._id,
    });

    if (!existingEntitlement) {
      await LearningEntitlement.create({
        userId: userObjId,
        postId: post._id,
        source: 'free_enrollment',
        isActive: true,
        grantedAt: new Date(),
      });
      post.enrollmentCount = (post.enrollmentCount || 0) + 1;
      await post.save();
    }

    const progress = await LearningProgress.findOneAndUpdate(
      { userId: userObjId, postId: post._id },
      {
        $set: {
          isSavedToLibrary: true,
          lastViewedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return progress;
  }

  static async updateCourseProgress(
    userId: string,
    postId: string,
    input: { lessonId?: string; completed?: boolean; markCourseCompleted?: boolean },
  ) {
    if (!Types.ObjectId.isValid(postId)) throw new Error('Invalid content ID');
    const post = await LearningPost.findById(new Types.ObjectId(postId));
    if (!post) throw new Error('Learning material not found');

    const access = await this.checkUserEntitlement(post, userId, false);
    if (!access.hasAccess) {
      throw new Error('Unauthorized: You must purchase or unlock this content to track progress.');
    }

    const userObjId = new Types.ObjectId(userId);
    let progress = await LearningProgress.findOne({
      userId: userObjId,
      postId: post._id,
    });

    if (!progress) {
      progress = new LearningProgress({
        userId: userObjId,
        postId: post._id,
        isSavedToLibrary: true,
        completedLessonIds: [],
        progressPercent: 0,
        isCompleted: false,
        lastViewedAt: new Date(),
      });
    }

    const completedSet = new Set(progress.completedLessonIds || []);
    if (input.lessonId) {
      const cleanLessonId = sanitizePlain(input.lessonId);
      if (input.completed === false) {
        completedSet.delete(cleanLessonId);
      } else {
        completedSet.add(cleanLessonId);
      }
    }

    progress.completedLessonIds = Array.from(completedSet);

    const totalLessons = (post.chapters || []).reduce(
      (sum, ch) => sum + (ch.lessons?.length || 0),
      0,
    );

    if (totalLessons > 0) {
      progress.progressPercent = Math.min(
        100,
        Math.round((progress.completedLessonIds.length / totalLessons) * 100),
      );
    } else if (input.markCourseCompleted) {
      progress.progressPercent = 100;
    }

    if (input.markCourseCompleted || progress.progressPercent === 100) {
      progress.isCompleted = true;
      if (!progress.completedAt) {
        progress.completedAt = new Date();
      }
      if (progress.progressPercent < 100) {
        progress.progressPercent = 100;
      }
    } else if (input.markCourseCompleted === false) {
      progress.isCompleted = false;
    }

    progress.lastViewedAt = new Date();
    await progress.save();

    return progress;
  }

  static async getLearnerLibrary(userId: string) {
    const userObjId = new Types.ObjectId(userId);

    const [entitlements, purchases, progressDocs, bookmarks] = await Promise.all([
      LearningEntitlement.find({ userId: userObjId, isActive: true })
        .sort({ grantedAt: -1 })
        .lean(),
      LearningPurchase.find({ buyerId: userObjId, status: 'succeeded' })
        .sort({ verifiedAt: -1 })
        .lean(),
      LearningProgress.find({ userId: userObjId }).sort({ lastViewedAt: -1 }).lean(),
      LearningBookmark.find({ userId: userObjId }).sort({ createdAt: -1 }).lean(),
    ]);

    const purchasedPostIdSet = new Set<string>();
    for (const p of purchases) purchasedPostIdSet.add(String(p.postId));
    for (const e of entitlements) {
      if (e.source === 'purchase') purchasedPostIdSet.add(String(e.postId));
    }

    const freeSavedPostIdSet = new Set<string>();
    for (const e of entitlements) {
      if (e.source === 'free_enrollment') freeSavedPostIdSet.add(String(e.postId));
    }
    for (const prog of progressDocs) {
      if (prog.isSavedToLibrary && !purchasedPostIdSet.has(String(prog.postId))) {
        freeSavedPostIdSet.add(String(prog.postId));
      }
    }

    const allPostIds = new Set<string>([
      ...Array.from(purchasedPostIdSet),
      ...Array.from(freeSavedPostIdSet),
      ...progressDocs.map((p) => String(p.postId)),
      ...bookmarks.map((b) => String(b.postId)),
    ]);

    const posts = await LearningPost.find({
      _id: { $in: Array.from(allPostIds).map((id) => new Types.ObjectId(id)) },
      status: { $in: ['published', 'archived'] },
    })
      .select(
        '-content -chapters.lessons.content -steps.content -codeSnippets.code -protectedFiles.storageKey',
      )
      .lean();

    const postMap = new Map(posts.map((p) => [String(p._id), p]));
    const progressMap = new Map(progressDocs.map((p) => [String(p.postId), p]));

    const enrichWithProgress = (post: any, hasAccess = true) => {
      const prog = progressMap.get(String(post._id));
      return {
        ...post,
        hasAccess,
        progress: prog
          ? {
              completedLessonIds: prog.completedLessonIds || [],
              progressPercent: prog.progressPercent || 0,
              isCompleted: Boolean(prog.isCompleted),
              completedAt: prog.completedAt,
              lastViewedAt: prog.lastViewedAt,
            }
          : {
              completedLessonIds: [],
              progressPercent: 0,
              isCompleted: false,
            },
      };
    };

    const purchasedContent = Array.from(purchasedPostIdSet)
      .map((id) => postMap.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => enrichWithProgress(p, true));

    const freeSavedMaterials = Array.from(freeSavedPostIdSet)
      .map((id) => postMap.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p && p.pricingType !== 'paid'))
      .map((p) => enrichWithProgress(p, true));

    const bookmarkedLessons = bookmarks
      .map((b) => postMap.get(String(b.postId)))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) =>
        enrichWithProgress(p, p.pricingType !== 'paid' || purchasedPostIdSet.has(String(p._id))),
      );

    const recentlyViewed = progressDocs
      .map((prog) => postMap.get(String(prog.postId)))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .slice(0, 20)
      .map((p) =>
        enrichWithProgress(p, p.pricingType !== 'paid' || purchasedPostIdSet.has(String(p._id))),
      );

    const completedCourses = progressDocs
      .filter((prog) => prog.isCompleted)
      .map((prog) => postMap.get(String(prog.postId)))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => enrichWithProgress(p, true));

    const inProgressMaterials = progressDocs
      .filter(
        (prog) =>
          (prog.progressPercent > 0 || prog.completedLessonIds.length > 0) && !prog.isCompleted,
      )
      .map((prog) => postMap.get(String(prog.postId)))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => enrichWithProgress(p, true));

    return {
      purchasedContent,
      freeSavedMaterials,
      bookmarkedLessons,
      recentlyViewed,
      inProgressMaterials,
      completedCourses,
      purchasesHistory: purchases,
    };
  }

  // --------------------------------------------------------------------------
  // Reporting & Admin Moderation (Phase 12)
  // --------------------------------------------------------------------------

  static async createReport(
    reporterUserId: string,
    targetType: LearningReportTargetType,
    targetId: string,
    reason: string,
    category: LearningReportCategory = 'other',
  ) {
    const cleanReason = sanitizePlain(reason).slice(0, 1000);
    if (cleanReason.length < 5) {
      throw new Error('Please provide a detailed reason (at least 5 characters)');
    }

    if (!Types.ObjectId.isValid(targetId)) {
      throw new Error('Invalid target ID');
    }

    const validCategories: LearningReportCategory[] = [
      'spam',
      'inappropriate',
      'copyright',
      'prohibited',
      'other',
    ];
    const safeCategory: LearningReportCategory = validCategories.includes(category)
      ? category
      : 'other';

    if (targetType === 'review') {
      await LearningReview.updateOne(
        { _id: new Types.ObjectId(targetId) },
        { $inc: { reportCount: 1 } },
      );
    }

    const report = await LearningReport.create({
      reporterUserId: new Types.ObjectId(reporterUserId),
      targetType,
      targetId: new Types.ObjectId(targetId),
      category: safeCategory,
      reason: cleanReason,
    });

    return report;
  }

  static async adminListPosts(params: {
    q?: string;
    status?: string;
    category?: string;
    pricingType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (params.status) query.status = params.status;
    if (params.category) query.category = params.category;
    if (params.pricingType) query.pricingType = params.pricingType;
    if (params.q) {
      const qRegex = { $regex: params.q.trim(), $options: 'i' };
      query.$or = [{ title: qRegex }, { authorName: qRegex }, { category: qRegex }];
    }

    const [items, total] = await Promise.all([
      LearningPost.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      LearningPost.countDocuments(query),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  static async adminModeratePost(
    postId: string,
    updates: {
      status?: LearningPostStatus;
      isFeatured?: boolean;
    },
  ) {
    const post = await LearningPost.findById(new Types.ObjectId(postId));
    if (!post) throw new Error('Post not found');

    if (
      updates.status !== undefined &&
      ['draft', 'published', 'hidden', 'archived', 'removed'].includes(updates.status)
    ) {
      post.status = updates.status;
    }
    if (updates.isFeatured !== undefined) post.isFeatured = updates.isFeatured;

    await post.save();
    return post;
  }

  static async adminModerateReview(reviewId: string, status: 'approved' | 'hidden' | 'pending') {
    if (!Types.ObjectId.isValid(reviewId)) throw new Error('Invalid review ID');
    const review = await LearningReview.findById(new Types.ObjectId(reviewId));
    if (!review) throw new Error('Review not found');

    review.status = status;
    await review.save();
    await this.recalculatePostRating(review.postId);

    return review;
  }

  static async adminListComments(params: { status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (params.status) query.status = params.status;

    const [items, total] = await Promise.all([
      LearningComment.find(query)
        .populate('postId', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LearningComment.countDocuments(query),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  static async adminModerateComment(
    commentId: string,
    status: 'active' | 'hidden' | 'deleted' | 'visible',
  ) {
    const comment = await LearningComment.findById(new Types.ObjectId(commentId));
    if (!comment) throw new Error('Comment not found');

    comment.status = status === 'visible' ? 'active' : status;
    await comment.save();

    const visibleCount = await LearningComment.countDocuments({
      postId: comment.postId,
      status: 'active',
    });
    await LearningPost.updateOne(
      { _id: comment.postId },
      { $set: { commentsCount: visibleCount } },
    );

    return comment;
  }

  static async adminListReports(params: { status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (params.status) query.status = params.status;

    const [items, total] = await Promise.all([
      LearningReport.find(query)
        .populate('reporterUserId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LearningReport.countDocuments(query),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  static async adminResolveReport(
    reportId: string,
    input: {
      status: 'reviewed' | 'resolved' | 'dismissed';
      actionTaken?: string;
      adminUserId: string;
    },
  ) {
    const report = await LearningReport.findById(new Types.ObjectId(reportId));
    if (!report) throw new Error('Report not found');

    report.status = input.status;
    if (input.actionTaken) {
      report.actionTaken = sanitizePlain(input.actionTaken);
    }
    report.reviewedBy = new Types.ObjectId(input.adminUserId);
    report.reviewedAt = new Date();

    await report.save();
    return report;
  }
}
