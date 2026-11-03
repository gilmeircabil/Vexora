import { Types } from 'mongoose';
import { DeveloperProfile, type IDeveloperProfile } from '../models/DeveloperProfile.js';
import { DeveloperProject, type ProjectCategory } from '../models/DeveloperProject.js';
import { DeveloperReport } from '../models/DeveloperReport.js';
import { ProjectReaction, type ReactionType } from '../models/ProjectReaction.js';
import { ProjectComment } from '../models/ProjectComment.js';
import { User } from '../models/User.js';

export interface DeveloperSearchFilters {
  q?: string;
  skills?: string[];
  experienceLevel?: string;
  remotePreference?: string;
  availability?: string;
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
}

export interface ProjectSearchFilters {
  q?: string;
  category?: ProjectCategory;
  technology?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export class DeveloperService {
  /**
   * Helper to sanitize string inputs to prevent XSS.
   */
  private static sanitize(str?: string): string {
    if (!str) return '';
    return str
      .replace(/[<>]/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .trim();
  }

  /**
   * Generates a safe URL slug.
   */
  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  // --------------------------------------------------------------------------
  // Developer Profile Methods
  // --------------------------------------------------------------------------

  static async getProfileByUsername(username: string, viewerUserId?: string) {
    const cleanUsername = username.toLowerCase().trim();
    const profile = await DeveloperProfile.findOne({ username: cleanUsername }).lean();

    if (!profile) return null;

    // Check visibility: if suspended or unpublished, only the owner can view it
    if (
      (profile.isSuspended || !profile.isPublished) &&
      profile.userId.toString() !== viewerUserId
    ) {
      return null;
    }

    // Load published projects for this profile
    const projects = await DeveloperProject.find({
      profileId: profile._id,
      status: 'published',
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return {
      profile,
      projects,
      isOwner: profile.userId.toString() === viewerUserId,
    };
  }

  static async getProfileByUserId(userId: string | Types.ObjectId) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return DeveloperProfile.findOne({ userId: uid }).lean();
  }

  static async createOrUpdateProfile(userId: string | Types.ObjectId, data: any) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    let username = this.sanitize(data.username)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');
    if (!username || username.length < 3) {
      // Auto-fallback username from user name/email if empty
      const user = await User.findById(uid);
      username = this.slugify(user?.name || `dev-${uid.toString().slice(-6)}`).slice(0, 30);
    }

    // Check username uniqueness if changing
    const existing = await DeveloperProfile.findOne({
      username,
      userId: { $ne: uid },
    });
    if (existing) {
      throw new Error(`Username "${username}" is already taken by another developer.`);
    }

    // Parse array fields safely
    const skills = Array.isArray(data.skills)
      ? data.skills.map((s: string) => this.sanitize(s)).filter(Boolean)
      : typeof data.skills === 'string'
        ? data.skills
            .split(',')
            .map((s: string) => this.sanitize(s))
            .filter(Boolean)
        : [];

    const technologies = Array.isArray(data.technologies)
      ? data.technologies.map((t: string) => this.sanitize(t)).filter(Boolean)
      : typeof data.technologies === 'string'
        ? data.technologies
            .split(',')
            .map((t: string) => this.sanitize(t))
            .filter(Boolean)
        : [];

    const services = Array.isArray(data.services)
      ? data.services.map((s: string) => this.sanitize(s)).filter(Boolean)
      : typeof data.services === 'string'
        ? data.services
            .split(',')
            .map((s: string) => this.sanitize(s))
            .filter(Boolean)
        : [];

    const updateFields: Partial<IDeveloperProfile> = {
      username,
      displayName: this.sanitize(data.displayName) || 'Developer',
      headline: this.sanitize(data.headline).slice(0, 160),
      biography: this.sanitize(data.biography).slice(0, 3000),
      skills: Array.from(new Set<string>(skills)).slice(0, 25),
      technologies: Array.from(new Set<string>(technologies)).slice(0, 25),
      experienceLevel: data.experienceLevel || 'intermediate',
      location: this.sanitize(data.location).slice(0, 100),
      remotePreference: data.remotePreference || 'remote',
      services: Array.from(new Set<string>(services)).slice(0, 15),
      availability: data.availability || 'available',
      portfolioUrl: this.sanitize(data.portfolioUrl),
      githubUrl: this.sanitize(data.githubUrl),
      linkedinUrl: this.sanitize(data.linkedinUrl),
      websiteUrl: this.sanitize(data.websiteUrl),
      contactPreferences: {
        allowContactForm: data.contactPreferences?.allowContactForm ?? true,
        preferredMethod: data.contactPreferences?.preferredMethod || 'form',
      },
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
    };

    if (data.profileImage !== undefined) updateFields.profileImage = data.profileImage;
    if (data.coverImage !== undefined) updateFields.coverImage = data.coverImage;

    const profile = await DeveloperProfile.findOneAndUpdate(
      { userId: uid },
      { $set: updateFields },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return profile;
  }

  static async searchDevelopers(filters: DeveloperSearchFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 12));
    const skip = (page - 1) * limit;

    const query: any = {
      isPublished: true,
      isSuspended: false,
    };

    if (filters.featuredOnly) {
      query.isFeatured = true;
    }

    if (filters.experienceLevel) {
      query.experienceLevel = filters.experienceLevel;
    }

    if (filters.remotePreference) {
      query.remotePreference = filters.remotePreference;
    }

    if (filters.availability) {
      query.availability = filters.availability;
    }

    if (filters.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills.map((s) => new RegExp(`^${s}$`, 'i')) };
    }

    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim();
      query.$or = [
        { displayName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { headline: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } },
        { technologies: { $regex: q, $options: 'i' } },
        { services: { $regex: q, $options: 'i' } },
      ];
    }

    const [developers, total] = await Promise.all([
      DeveloperProfile.find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DeveloperProfile.countDocuments(query),
    ]);

    return {
      developers,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getFeaturedDevelopers(limit = 6) {
    return DeveloperProfile.find({
      isPublished: true,
      isSuspended: false,
      isFeatured: true,
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
  }

  // --------------------------------------------------------------------------
  // Developer Project Methods
  // --------------------------------------------------------------------------

  static async createProject(userId: string | Types.ObjectId, data: any) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const profile = await DeveloperProfile.findOne({ userId: uid });
    if (!profile) {
      throw new Error('Please create a developer profile first before publishing projects.');
    }

    const title = this.sanitize(data.title);
    if (!title) throw new Error('Project title is required.');

    const baseSlug = this.slugify(title) || 'project';
    let slug = baseSlug;
    let counter = 1;

    // Avoid slug collisions
    while (await DeveloperProject.exists({ slug })) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    const technologies = Array.isArray(data.technologies)
      ? data.technologies.map((t: string) => this.sanitize(t)).filter(Boolean)
      : typeof data.technologies === 'string'
        ? data.technologies
            .split(',')
            .map((t: string) => this.sanitize(t))
            .filter(Boolean)
        : [];

    const screenshots = Array.isArray(data.screenshots)
      ? data.screenshots.filter((s: string) => typeof s === 'string' && s.startsWith('/'))
      : [];

    const project = await DeveloperProject.create({
      ownerId: uid,
      profileId: profile._id,
      title,
      slug,
      description: this.sanitize(data.description),
      category: data.category || 'web',
      coverImage: data.coverImage || '',
      screenshots: screenshots.slice(0, 8),
      technologies: Array.from(new Set<string>(technologies)).slice(0, 20),
      role: this.sanitize(data.role) || 'Creator',
      contributions: this.sanitize(data.contributions),
      liveDemoUrl: this.sanitize(data.liveDemoUrl),
      repositoryUrl: this.sanitize(data.repositoryUrl),
      completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
      status: data.status === 'draft' ? 'draft' : 'published',
      publishedAt: data.status === 'draft' ? undefined : new Date(),
    });

    return project;
  }

  static async getProjectBySlug(slug: string, incrementView = false) {
    const project = await DeveloperProject.findOne({ slug }).populate('profileId').lean();
    if (!project) return null;

    if (incrementView && project.status === 'published') {
      await DeveloperProject.updateOne({ _id: project._id }, { $inc: { viewCount: 1 } });
      project.viewCount += 1;
    }

    return project;
  }

  static async updateProject(userId: string | Types.ObjectId, projectId: string, data: any) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const project = await DeveloperProject.findById(new Types.ObjectId(projectId));

    if (!project) throw new Error('Project not found.');
    if (project.ownerId.toString() !== uid.toString()) {
      throw new Error('Unauthorized to modify this project.');
    }

    if (data.title) {
      project.title = this.sanitize(data.title);
    }
    if (data.description !== undefined) {
      project.description = this.sanitize(data.description);
    }
    if (data.category) {
      project.category = data.category;
    }
    if (data.coverImage !== undefined) {
      project.coverImage = data.coverImage;
    }
    if (Array.isArray(data.screenshots)) {
      project.screenshots = data.screenshots.slice(0, 8);
    }
    if (data.technologies) {
      const techList = Array.isArray(data.technologies)
        ? data.technologies
        : data.technologies.split(',');
      project.technologies = Array.from(
        new Set<string>(techList.map((t: string) => this.sanitize(t)).filter(Boolean)),
      ).slice(0, 20);
    }
    if (data.role !== undefined) project.role = this.sanitize(data.role);
    if (data.contributions !== undefined) project.contributions = this.sanitize(data.contributions);
    if (data.liveDemoUrl !== undefined) project.liveDemoUrl = this.sanitize(data.liveDemoUrl);
    if (data.repositoryUrl !== undefined) project.repositoryUrl = this.sanitize(data.repositoryUrl);
    if (data.completionDate !== undefined) {
      project.completionDate = data.completionDate ? new Date(data.completionDate) : undefined;
    }
    if (data.status) {
      project.status = data.status;
      if (data.status === 'published' && !project.publishedAt) {
        project.publishedAt = new Date();
      }
    }

    await project.save();
    return project;
  }

  static async deleteProject(userId: string | Types.ObjectId, projectId: string) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const project = await DeveloperProject.findById(new Types.ObjectId(projectId));

    if (!project) throw new Error('Project not found.');
    if (project.ownerId.toString() !== uid.toString()) {
      throw new Error('Unauthorized to delete this project.');
    }

    await DeveloperProject.deleteOne({ _id: project._id });
    return { success: true };
  }

  static async searchProjects(filters: ProjectSearchFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 12));
    const skip = (page - 1) * limit;

    const query: any = {
      status: filters.status || 'published',
    };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.technology) {
      query.technologies = { $regex: new RegExp(`^${filters.technology}$`, 'i') };
    }

    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { technologies: { $regex: q, $options: 'i' } },
        { role: { $regex: q, $options: 'i' } },
      ];
    }

    const [projects, total] = await Promise.all([
      DeveloperProject.find(query)
        .populate('profileId', 'username displayName profileImage experienceLevel')
        .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DeveloperProject.countDocuments(query),
    ]);

    return {
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getProjectsByOwner(userId: string | Types.ObjectId) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const projects = await DeveloperProject.find({ ownerId: uid }).sort({ createdAt: -1 }).lean();

    // Attach reaction and comment counts to each project for developer insights
    const enriched = await Promise.all(
      projects.map(async (proj) => {
        const [reactionCount, commentCount] = await Promise.all([
          ProjectReaction.countDocuments({ projectId: proj._id }),
          ProjectComment.countDocuments({ projectId: proj._id }),
        ]);
        return {
          ...proj,
          reactionCount,
          commentCount,
        };
      }),
    );

    return enriched;
  }

  // --------------------------------------------------------------------------
  // Project Engagement (Views, Reactions, Comments)
  // --------------------------------------------------------------------------

  static async recordProjectView(slugOrId: string) {
    const isId = Types.ObjectId.isValid(slugOrId);
    const query = isId ? { _id: new Types.ObjectId(slugOrId) } : { slug: slugOrId };

    const updated = await DeveloperProject.findOneAndUpdate(
      query,
      { $inc: { viewCount: 1 } },
      { new: true, select: 'viewCount slug title' },
    ).lean();

    return updated ? updated.viewCount : 0;
  }

  static async getProjectReactions(projectId: Types.ObjectId | string, identifier?: string) {
    const pid = typeof projectId === 'string' ? new Types.ObjectId(projectId) : projectId;

    const reactions = await ProjectReaction.find({ projectId: pid }).lean();

    const counts: Record<ReactionType, number> = {
      love: 0,
      rocket: 0,
      fire: 0,
      insightful: 0,
      like: 0,
    };

    const userReactions: ReactionType[] = [];

    for (const r of reactions) {
      if (counts[r.reaction] !== undefined) {
        counts[r.reaction] += 1;
      }
      if (identifier && r.identifier === identifier) {
        userReactions.push(r.reaction);
      }
    }

    return {
      counts,
      total: reactions.length,
      userReactions,
    };
  }

  static async toggleProjectReaction(params: {
    projectId: Types.ObjectId | string;
    identifier: string;
    userId?: Types.ObjectId | string;
    reaction: ReactionType;
  }) {
    const pid =
      typeof params.projectId === 'string'
        ? new Types.ObjectId(params.projectId)
        : params.projectId;
    const uid = params.userId
      ? typeof params.userId === 'string'
        ? new Types.ObjectId(params.userId)
        : params.userId
      : undefined;

    const existing = await ProjectReaction.findOne({
      projectId: pid,
      identifier: params.identifier,
      reaction: params.reaction,
    });

    let reacted = false;
    if (existing) {
      await ProjectReaction.deleteOne({ _id: existing._id });
      reacted = false;
    } else {
      await ProjectReaction.create({
        projectId: pid,
        identifier: params.identifier,
        userId: uid,
        reaction: params.reaction,
      });
      reacted = true;
    }

    const summary = await this.getProjectReactions(pid, params.identifier);
    return {
      reacted,
      ...summary,
    };
  }

  static async getProjectComments(projectId: Types.ObjectId | string) {
    const pid = typeof projectId === 'string' ? new Types.ObjectId(projectId) : projectId;
    return ProjectComment.find({ projectId: pid }).sort({ createdAt: -1 }).lean();
  }

  static async addProjectComment(params: {
    projectId: Types.ObjectId | string;
    userId?: Types.ObjectId | string;
    authorName: string;
    authorAvatar?: string;
    content: string;
  }) {
    const pid =
      typeof params.projectId === 'string'
        ? new Types.ObjectId(params.projectId)
        : params.projectId;
    const uid = params.userId
      ? typeof params.userId === 'string'
        ? new Types.ObjectId(params.userId)
        : params.userId
      : undefined;

    const project = await DeveloperProject.findById(pid);
    if (!project) throw new Error('Project not found.');

    const isAuthor = uid && project.ownerId ? project.ownerId.toString() === uid.toString() : false;

    const cleanContent = this.sanitize(params.content);
    if (!cleanContent) {
      throw new Error('Comment cannot be empty.');
    }

    const comment = await ProjectComment.create({
      projectId: pid,
      userId: uid,
      authorName: this.sanitize(params.authorName).slice(0, 60) || 'Guest Viewer',
      authorAvatar: params.authorAvatar || '',
      isAuthor,
      content: cleanContent.slice(0, 2000),
    });

    return comment;
  }

  static async deleteProjectComment(commentId: string, userId: string | Types.ObjectId) {
    if (!Types.ObjectId.isValid(commentId)) throw new Error('Invalid comment ID.');
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const comment = await ProjectComment.findById(new Types.ObjectId(commentId));
    if (!comment) throw new Error('Comment not found.');

    const project = await DeveloperProject.findById(comment.projectId);

    // Can delete if comment author OR project owner OR admin
    const userDoc = await User.findById(uid);
    const isAdmin = userDoc?.role === 'admin';
    const isCommentAuthor = comment.userId && comment.userId.toString() === uid.toString();
    const isProjectOwner = project && project.ownerId.toString() === uid.toString();

    if (!isAdmin && !isCommentAuthor && !isProjectOwner) {
      throw new Error('Unauthorized to delete this comment.');
    }

    await ProjectComment.deleteOne({ _id: comment._id });
    return { success: true };
  }

  // --------------------------------------------------------------------------
  // Reporting & Abuse Prevention
  // --------------------------------------------------------------------------

  static async submitReport(params: {
    reporterId?: string | Types.ObjectId;
    reporterEmail?: string;
    targetType: 'profile' | 'project';
    targetId: string;
    reason: any;
    description: string;
  }) {
    if (!Types.ObjectId.isValid(params.targetId)) {
      throw new Error('Invalid target ID.');
    }

    let targetIdentifier = '';
    if (params.targetType === 'profile') {
      const p = await DeveloperProfile.findById(new Types.ObjectId(params.targetId));
      targetIdentifier = p?.username || '';
    } else {
      const pr = await DeveloperProject.findById(new Types.ObjectId(params.targetId));
      targetIdentifier = pr?.slug || '';
    }

    const report = await DeveloperReport.create({
      reporterId: params.reporterId ? new Types.ObjectId(params.reporterId) : undefined,
      reporterEmail: params.reporterEmail?.trim().toLowerCase(),
      targetType: params.targetType,
      targetId: new Types.ObjectId(params.targetId),
      targetIdentifier,
      reason: params.reason || 'inappropriate',
      description: this.sanitize(params.description).slice(0, 2000),
      status: 'pending',
    });

    return report;
  }

  // --------------------------------------------------------------------------
  // Admin Moderation Methods
  // --------------------------------------------------------------------------

  static async adminListDevelopers(filters: { q?: string; page?: number; limit?: number }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.q) {
      query.$or = [
        { displayName: { $regex: filters.q, $options: 'i' } },
        { username: { $regex: filters.q, $options: 'i' } },
      ];
    }

    const [developers, total] = await Promise.all([
      DeveloperProfile.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      DeveloperProfile.countDocuments(query),
    ]);

    return { developers, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  static async adminSetDeveloperStatus(
    profileId: string,
    updates: { isFeatured?: boolean; isSuspended?: boolean; suspensionReason?: string },
  ) {
    const profile = await DeveloperProfile.findById(new Types.ObjectId(profileId));
    if (!profile) throw new Error('Developer profile not found.');

    if (updates.isFeatured !== undefined) profile.isFeatured = Boolean(updates.isFeatured);
    if (updates.isSuspended !== undefined) profile.isSuspended = Boolean(updates.isSuspended);
    if (updates.suspensionReason !== undefined) profile.suspensionReason = updates.suspensionReason;

    await profile.save();
    return profile;
  }

  static async adminListProjects(filters: {
    q?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.category) query.category = filters.category;
    if (filters.q) {
      query.$or = [
        { title: { $regex: filters.q, $options: 'i' } },
        { slug: { $regex: filters.q, $options: 'i' } },
      ];
    }

    const [projects, total] = await Promise.all([
      DeveloperProject.find(query)
        .populate('profileId', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DeveloperProject.countDocuments(query),
    ]);

    return { projects, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  static async adminSetProjectStatus(
    projectId: string,
    updates: { status?: 'draft' | 'published' | 'archived'; isFeatured?: boolean },
  ) {
    const project = await DeveloperProject.findById(new Types.ObjectId(projectId));
    if (!project) throw new Error('Project not found.');

    if (updates.status) project.status = updates.status;
    if (updates.isFeatured !== undefined) project.isFeatured = Boolean(updates.isFeatured);

    await project.save();
    return project;
  }

  static async adminDeleteProject(projectId: string) {
    await DeveloperProject.findByIdAndDelete(new Types.ObjectId(projectId));
    return { success: true };
  }

  static async adminListReports(filters: { status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.status) query.status = filters.status;

    const [reports, total] = await Promise.all([
      DeveloperReport.find(query)
        .populate('reporterId', 'name email')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DeveloperReport.countDocuments(query),
    ]);

    return { reports, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  static async adminResolveReport(
    reportId: string,
    params: { status: 'resolved' | 'dismissed'; actionTaken?: string; adminUserId: string },
  ) {
    const report = await DeveloperReport.findById(new Types.ObjectId(reportId));
    if (!report) throw new Error('Report not found.');

    report.status = params.status;
    report.actionTaken = params.actionTaken || '';
    report.reviewedBy = new Types.ObjectId(params.adminUserId);
    report.reviewedAt = new Date();

    await report.save();
    return report;
  }
}
