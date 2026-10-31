import type { Request, Response } from 'express';
import { DeveloperService } from '../services/developerService.js';
import { StorageService } from '../services/storageService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class DeveloperController {
  // --------------------------------------------------------------------------
  // Developer Profiles
  // --------------------------------------------------------------------------

  static async searchDevelopers(req: Request, res: Response): Promise<void> {
    try {
      const { q, experienceLevel, remotePreference, availability, skills, page, limit, featured } = req.query;

      const skillList = typeof skills === 'string' ? skills.split(',').map((s) => s.trim()) : undefined;

      const result = await DeveloperService.searchDevelopers({
        q: q as string,
        experienceLevel: experienceLevel as string,
        remotePreference: remotePreference as string,
        availability: availability as string,
        skills: skillList,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
        featuredOnly: featured === 'true',
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to search developers' });
    }
  }

  static async getFeaturedDevelopers(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(12, parseInt(req.query.limit as string, 10) || 6);
      const featured = await DeveloperService.getFeaturedDevelopers(limit);
      res.status(200).json({ success: true, data: featured });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to load featured developers' });
    }
  }

  static async getProfileByUsername(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const username = req.params.username as string;
      if (!username) {
        res.status(400).json({ success: false, error: 'Username is required.' });
        return;
      }

      const result = await DeveloperService.getProfileByUsername(username, req.user?.userId);
      if (!result) {
        res.status(404).json({ success: false, error: 'Developer profile not found.' });
        return;
      }

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to retrieve profile' });
    }
  }

  static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const profile = await DeveloperService.getProfileByUserId(req.user.userId);
      res.status(200).json({ success: true, data: profile });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch your profile' });
    }
  }

  static async saveProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const profile = await DeveloperService.createOrUpdateProfile(req.user.userId, req.body);
      res.status(200).json({ success: true, data: profile });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to save developer profile' });
    }
  }

  static async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'Please choose an image file to upload.' });
        return;
      }

      const saved = await StorageService.saveAsset({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        userId: req.user.userId,
      });

      const profile = await DeveloperService.createOrUpdateProfile(req.user.userId, {
        profileImage: saved.url,
      });

      res.status(200).json({
        success: true,
        data: {
          url: saved.url,
          thumbnailUrl: saved.thumbnailUrl,
          profile,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Avatar upload failed' });
    }
  }

  static async uploadCover(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'Please choose an image file to upload.' });
        return;
      }

      const saved = await StorageService.saveAsset({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        userId: req.user.userId,
      });

      const profile = await DeveloperService.createOrUpdateProfile(req.user.userId, {
        coverImage: saved.url,
      });

      res.status(200).json({
        success: true,
        data: {
          url: saved.url,
          profile,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Cover photo upload failed' });
    }
  }

  // --------------------------------------------------------------------------
  // Projects
  // --------------------------------------------------------------------------

  static async searchProjects(req: Request, res: Response): Promise<void> {
    try {
      const { q, category, technology, page, limit } = req.query;

      const result = await DeveloperService.searchProjects({
        q: q as string,
        category: category as any,
        technology: technology as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
        status: 'published',
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to search projects' });
    }
  }

  static async getMyProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const projects = await DeveloperService.getProjectsByOwner(req.user.userId);
      res.status(200).json({ success: true, data: projects });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to load projects' });
    }
  }

  static async getProjectBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = req.params.slug as string;
      if (!slug) {
        res.status(400).json({ success: false, error: 'Slug is required.' });
        return;
      }

      const project = await DeveloperService.getProjectBySlug(slug, true);
      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found.' });
        return;
      }

      res.status(200).json({ success: true, data: project });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to load project details' });
    }
  }

  static async createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const project = await DeveloperService.createProject(req.user.userId, req.body);
      res.status(201).json({ success: true, data: project });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create project' });
    }
  }

  static async updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const projectId = req.params.id as string;
      const project = await DeveloperService.updateProject(req.user.userId, projectId, req.body);
      res.status(200).json({ success: true, data: project });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update project' });
    }
  }

  static async deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const projectId = req.params.id as string;
      const result = await DeveloperService.deleteProject(req.user.userId, projectId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to delete project' });
    }
  }

  // --------------------------------------------------------------------------
  // Contact & Inquiries
  // --------------------------------------------------------------------------

  static async contactDeveloper(req: Request, res: Response): Promise<void> {
    try {
      const username = req.params.username as string;
      const { senderName, senderEmail, subject, message } = req.body;

      if (!senderName || !senderEmail || !subject || !message) {
        res.status(400).json({ success: false, error: 'All fields are required to contact developer.' });
        return;
      }

      const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

      await DeveloperService.sendMessageToDeveloper({
        recipientUsername: username,
        senderName,
        senderEmail,
        subject,
        message,
        clientIp,
      });

      res.status(200).json({
        success: true,
        message: 'Your inquiry has been delivered directly to the developer.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to send message' });
    }
  }

  // --------------------------------------------------------------------------
  // Reporting & Abuse Prevention
  // --------------------------------------------------------------------------

  static async submitReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { targetType, targetId, reason, description, reporterEmail } = req.body;

      if (!targetType || !targetId || !description) {
        res.status(400).json({ success: false, error: 'Target and description are required.' });
        return;
      }

      const report = await DeveloperService.submitReport({
        reporterId: req.user?.userId,
        reporterEmail: reporterEmail || req.user?.email,
        targetType,
        targetId,
        reason,
        description,
      });

      res.status(201).json({
        success: true,
        message: 'Report submitted. Our moderation team will review this listing.',
        data: { reportId: report._id },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to submit report' });
    }
  }

  // --------------------------------------------------------------------------
  // Project Engagement (Views, Reactions, Comments)
  // --------------------------------------------------------------------------

  static async recordProjectView(req: Request, res: Response): Promise<void> {
    try {
      const idOrSlug = String(req.params.idOrSlug || '');
      const views = await DeveloperService.recordProjectView(idOrSlug);
      res.status(200).json({ success: true, data: { viewCount: views } });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getProjectReactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = String(req.params.projectId || '');
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const identifier = req.user?.userId || clientIp;

      const reactions = await DeveloperService.getProjectReactions(projectId, identifier);
      res.status(200).json({ success: true, data: reactions });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async toggleProjectReaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = String(req.params.projectId || '');
      const { reaction } = req.body;
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const identifier = req.user?.userId || clientIp;

      if (!['love', 'rocket', 'fire', 'insightful', 'like'].includes(reaction)) {
        res.status(400).json({ success: false, error: 'Invalid reaction type.' });
        return;
      }

      const result = await DeveloperService.toggleProjectReaction({
        projectId,
        identifier,
        userId: req.user?.userId,
        reaction,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getProjectComments(req: Request, res: Response): Promise<void> {
    try {
      const projectId = String(req.params.projectId || '');
      const comments = await DeveloperService.getProjectComments(projectId);
      res.status(200).json({ success: true, data: comments });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async addProjectComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = String(req.params.projectId || '');
      const { content, authorName, authorAvatar } = req.body;

      if (!content || !content.trim()) {
        res.status(400).json({ success: false, error: 'Comment content is required.' });
        return;
      }

      const resolvedName = req.user ? req.user.email.split('@')[0] : authorName || 'Guest Viewer';

      const comment = await DeveloperService.addProjectComment({
        projectId,
        userId: req.user?.userId,
        authorName: resolvedName,
        authorAvatar: authorAvatar || '',
        content,
      });

      res.status(201).json({ success: true, data: comment });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteProjectComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const commentId = String(req.params.commentId || '');
      const result = await DeveloperService.deleteProjectComment(commentId, req.user.userId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
