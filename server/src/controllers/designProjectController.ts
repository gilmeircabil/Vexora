import type { Response } from 'express';
import { Types } from 'mongoose';
import { DesignProject } from '../models/DesignProject.js';
import { DesignVersion } from '../models/DesignVersion.js';
import { DesignAsset } from '../models/DesignAsset.js';
import { StorageService } from '../services/storageService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

function getParam(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

export class DesignProjectController {
  /**
   * Create a new design project
   * Route: POST /api/designs
   */
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const {
        title = 'Untitled Design',
        description = '',
        width = 1080,
        height = 1080,
        background = '#ffffff',
        category = 'custom',
        documentData,
        thumbnailUrl = '',
      } = req.body;

      // Validate dimensions
      const numWidth = Math.min(Math.max(Number(width) || 1080, 50), 8000);
      const numHeight = Math.min(Math.max(Number(height) || 1080, 50), 8000);

      const project = await DesignProject.create({
        userId: new Types.ObjectId(userId),
        title: String(title).trim().slice(0, 150) || 'Untitled Design',
        description: String(description || '')
          .trim()
          .slice(0, 1000),
        width: numWidth,
        height: numHeight,
        background: String(background || '#ffffff'),
        category: String(category || 'custom'),
        documentData: documentData || {
          version: '7.4.0',
          objects: [],
        },
        thumbnailUrl: String(thumbnailUrl || ''),
        currentVersion: 1,
        revision: 1,
        isStarred: false,
      });

      // Automatically create Version 1 snapshot
      await DesignVersion.create({
        projectId: project._id,
        userId: new Types.ObjectId(userId),
        versionNumber: 1,
        versionName: 'Initial design',
        documentData: project.documentData,
        thumbnailUrl: project.thumbnailUrl,
      });

      res.status(201).json({
        success: true,
        project,
      });
    } catch (err: any) {
      console.error('Create design error:', err);
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to create design project' });
    }
  }

  /**
   * List user's design projects with search, filter, sort
   * Route: GET /api/designs
   */
  static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const {
        search,
        category,
        starred,
        sort = 'updatedAt_desc',
        limit = 50,
        page = 1,
      } = req.query;

      const query: Record<string, any> = {
        userId: new Types.ObjectId(userId),
      };

      if (starred === 'true') {
        query.isStarred = true;
      }

      if (category && typeof category === 'string' && category !== 'all') {
        query.category = category;
      }

      if (search && typeof search === 'string' && search.trim()) {
        query.title = { $regex: search.trim(), $options: 'i' };
      }

      let sortOptions: Record<string, 1 | -1> = { updatedAt: -1 };
      if (sort === 'updatedAt_asc') sortOptions = { updatedAt: 1 };
      else if (sort === 'createdAt_desc') sortOptions = { createdAt: -1 };
      else if (sort === 'createdAt_asc') sortOptions = { createdAt: 1 };
      else if (sort === 'title_asc') sortOptions = { title: 1 };
      else if (sort === 'title_desc') sortOptions = { title: -1 };

      const pageNum = Math.max(Number(page) || 1, 1);
      const limitNum = Math.min(Math.max(Number(limit) || 50, 1), 100);
      const skip = (pageNum - 1) * limitNum;

      const [projects, total] = await Promise.all([
        DesignProject.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .select('-documentData') // omit heavy canvas payload in dashboard list
          .lean(),
        DesignProject.countDocuments(query),
      ]);

      res.json({
        success: true,
        projects,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err: any) {
      console.error('List designs error:', err);
      res.status(500).json({ success: false, error: 'Failed to list design projects' });
    }
  }

  /**
   * Get single design project by ID
   * Route: GET /api/designs/:projectId
   */
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const projectId = getParam(req.params.projectId);

      if (!projectId || !Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
      }

      const project = await DesignProject.findOne({
        _id: new Types.ObjectId(projectId),
        userId: new Types.ObjectId(userId),
      });

      if (!project) {
        res.status(404).json({ success: false, error: 'Design project not found' });
        return;
      }

      res.json({
        success: true,
        project,
      });
    } catch (err: any) {
      console.error('Get design error:', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve design project' });
    }
  }

  /**
   * Update design project (supports debounced autosave, optimistic concurrency)
   * Route: PATCH /api/designs/:projectId
   */
  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const projectId = getParam(req.params.projectId);

      if (!projectId || !Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
      }

      const project = await DesignProject.findOne({
        _id: new Types.ObjectId(projectId),
        userId: new Types.ObjectId(userId),
      });

      if (!project) {
        res.status(404).json({ success: false, error: 'Design project not found' });
        return;
      }

      const {
        title,
        description,
        width,
        height,
        background,
        category,
        documentData,
        thumbnailUrl,
        isStarred,
        revision,
      } = req.body;

      // Optimistic concurrency check if client provided revision
      if (typeof revision === 'number' && revision < project.revision) {
        res.status(409).json({
          success: false,
          conflict: true,
          error: 'Conflict: This project has been updated in another session or window.',
          serverRevision: project.revision,
          project,
        });
        return;
      }

      if (title !== undefined) project.title = String(title).trim().slice(0, 150) || project.title;
      if (description !== undefined)
        project.description = String(description).trim().slice(0, 1000);
      if (width !== undefined)
        project.width = Math.min(Math.max(Number(width) || project.width, 50), 8000);
      if (height !== undefined)
        project.height = Math.min(Math.max(Number(height) || project.height, 50), 8000);
      if (background !== undefined) project.background = String(background);
      if (category !== undefined) project.category = String(category);
      if (documentData !== undefined) project.documentData = documentData;
      if (thumbnailUrl !== undefined) project.thumbnailUrl = String(thumbnailUrl);
      if (isStarred !== undefined) project.isStarred = Boolean(isStarred);

      // Increment revision
      project.revision += 1;
      await project.save();

      res.json({
        success: true,
        project,
      });
    } catch (err: any) {
      console.error('Update design error:', err);
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to update design project' });
    }
  }

  /**
   * Delete design project and associated versions/assets
   * Route: DELETE /api/designs/:projectId
   */
  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const projectId = getParam(req.params.projectId);

      if (!projectId || !Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
      }

      const project = await DesignProject.findOneAndDelete({
        _id: new Types.ObjectId(projectId),
        userId: new Types.ObjectId(userId),
      });

      if (!project) {
        res.status(404).json({ success: false, error: 'Design project not found' });
        return;
      }

      // Cleanup associated versions
      await DesignVersion.deleteMany({ projectId: project._id });

      // Clean up project assets if any
      const assets = await DesignAsset.find({ projectId: project._id });
      for (const asset of assets) {
        await StorageService.deleteAsset(asset.storageKey);
      }
      await DesignAsset.deleteMany({ projectId: project._id });

      res.json({
        success: true,
        message: 'Design project and its resources have been successfully deleted',
      });
    } catch (err: any) {
      console.error('Delete design error:', err);
      res.status(500).json({ success: false, error: 'Failed to delete design project' });
    }
  }

  /**
   * Duplicate design project
   * Route: POST /api/designs/:projectId/duplicate
   */
  static async duplicate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const projectId = getParam(req.params.projectId);

      if (!projectId || !Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
      }

      const sourceProject = await DesignProject.findOne({
        _id: new Types.ObjectId(projectId),
        userId: new Types.ObjectId(userId),
      });

      if (!sourceProject) {
        res.status(404).json({ success: false, error: 'Design project not found' });
        return;
      }

      const duplicated = await DesignProject.create({
        userId: new Types.ObjectId(userId),
        title: `Copy of ${sourceProject.title}`,
        description: sourceProject.description,
        width: sourceProject.width,
        height: sourceProject.height,
        background: sourceProject.background,
        category: sourceProject.category,
        documentData: sourceProject.documentData,
        thumbnailUrl: sourceProject.thumbnailUrl,
        currentVersion: 1,
        revision: 1,
        isStarred: false,
      });

      await DesignVersion.create({
        projectId: duplicated._id,
        userId: new Types.ObjectId(userId),
        versionNumber: 1,
        versionName: `Duplicate of ${sourceProject.title}`,
        documentData: duplicated.documentData,
        thumbnailUrl: duplicated.thumbnailUrl,
      });

      res.status(201).json({
        success: true,
        project: duplicated,
      });
    } catch (err: any) {
      console.error('Duplicate design error:', err);
      res.status(500).json({ success: false, error: 'Failed to duplicate design project' });
    }
  }

  /**
   * Save or update project thumbnail
   * Route: POST /api/designs/:projectId/thumbnail
   */
  static async saveThumbnail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const projectId = getParam(req.params.projectId);
      const { thumbnailUrl } = req.body;

      if (!projectId || !Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
      }

      if (!thumbnailUrl || typeof thumbnailUrl !== 'string') {
        res.status(400).json({ success: false, error: 'Thumbnail data is required' });
        return;
      }

      const project = await DesignProject.findOneAndUpdate(
        {
          _id: new Types.ObjectId(projectId),
          userId: new Types.ObjectId(userId),
        },
        { $set: { thumbnailUrl } },
        { new: true },
      );

      if (!project) {
        res.status(404).json({ success: false, error: 'Design project not found' });
        return;
      }

      res.json({
        success: true,
        thumbnailUrl: project.thumbnailUrl,
      });
    } catch (err: any) {
      console.error('Save thumbnail error:', err);
      res.status(500).json({ success: false, error: 'Failed to save project thumbnail' });
    }
  }
}
