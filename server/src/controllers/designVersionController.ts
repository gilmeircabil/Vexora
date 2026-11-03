import type { Response } from 'express';
import { Types } from 'mongoose';
import { DesignProject } from '../models/DesignProject.js';
import { DesignVersion } from '../models/DesignVersion.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

function getParam(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

export class DesignVersionController {
  /**
   * List all versions for a project
   * Route: GET /api/designs/:projectId/versions
   */
  static async listVersions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const projectId = getParam(req.params.projectId);

      if (!projectId || !Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
      }

      // Verify project ownership
      const project = await DesignProject.findOne({
        _id: new Types.ObjectId(projectId),
        userId: new Types.ObjectId(userId),
      });

      if (!project) {
        res.status(404).json({ success: false, error: 'Design project not found' });
        return;
      }

      const versions = await DesignVersion.find({
        projectId: project._id,
        userId: new Types.ObjectId(userId),
      })
        .sort({ versionNumber: -1 })
        .select('-documentData') // omit full canvas JSON in version list for speed
        .lean();

      res.json({
        success: true,
        versions,
        currentVersion: project.currentVersion,
      });
    } catch (err: any) {
      console.error('List versions error:', err);
      res.status(500).json({ success: false, error: 'Failed to list versions' });
    }
  }

  /**
   * Create a manual named snapshot
   * Route: POST /api/designs/:projectId/versions
   */
  static async createSnapshot(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const projectId = getParam(req.params.projectId);
      const { versionName, documentData, thumbnailUrl } = req.body;

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

      const nextVersionNumber = project.currentVersion + 1;
      const label =
        String(versionName || '')
          .trim()
          .slice(0, 120) || `Version ${nextVersionNumber}`;
      const doc = documentData || project.documentData;
      const thumb = thumbnailUrl || project.thumbnailUrl;

      const version = await DesignVersion.create({
        projectId: project._id,
        userId: new Types.ObjectId(userId),
        versionNumber: nextVersionNumber,
        versionName: label,
        documentData: doc,
        thumbnailUrl: thumb,
      });

      project.currentVersion = nextVersionNumber;
      project.revision += 1;
      if (documentData) project.documentData = documentData;
      if (thumb) project.thumbnailUrl = thumb;
      await project.save();

      // Enforce configurable retention limit: keep latest 30 versions
      const versionsCount = await DesignVersion.countDocuments({ projectId: project._id });
      if (versionsCount > 30) {
        const excess = await DesignVersion.find({ projectId: project._id })
          .sort({ versionNumber: 1 })
          .limit(versionsCount - 30);
        const excessIds = excess.map((v) => v._id);
        await DesignVersion.deleteMany({ _id: { $in: excessIds } });
      }

      res.status(201).json({
        success: true,
        version,
        project,
      });
    } catch (err: any) {
      console.error('Create version snapshot error:', err);
      res.status(500).json({ success: false, error: 'Failed to create version snapshot' });
    }
  }

  /**
   * Get single version by ID
   * Route: GET /api/designs/:projectId/versions/:versionId
   */
  static async getVersion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const projectId = getParam(req.params.projectId);
      const versionId = getParam(req.params.versionId);

      if (
        !projectId ||
        !versionId ||
        !Types.ObjectId.isValid(projectId) ||
        !Types.ObjectId.isValid(versionId)
      ) {
        res.status(400).json({ success: false, error: 'Invalid ID parameters' });
        return;
      }

      const version = await DesignVersion.findOne({
        _id: new Types.ObjectId(versionId),
        projectId: new Types.ObjectId(projectId),
        userId: new Types.ObjectId(userId),
      });

      if (!version) {
        res.status(404).json({ success: false, error: 'Version not found' });
        return;
      }

      res.json({
        success: true,
        version,
      });
    } catch (err: any) {
      console.error('Get version error:', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve version' });
    }
  }

  /**
   * Restore an older version: creates a new revision based on restored snapshot
   * Route: POST /api/designs/:projectId/versions/:versionId/restore
   */
  static async restoreVersion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const projectId = getParam(req.params.projectId);
      const versionId = getParam(req.params.versionId);

      if (
        !projectId ||
        !versionId ||
        !Types.ObjectId.isValid(projectId) ||
        !Types.ObjectId.isValid(versionId)
      ) {
        res.status(400).json({ success: false, error: 'Invalid ID parameters' });
        return;
      }

      const [project, snapshotToRestore] = await Promise.all([
        DesignProject.findOne({
          _id: new Types.ObjectId(projectId),
          userId: new Types.ObjectId(userId),
        }),
        DesignVersion.findOne({
          _id: new Types.ObjectId(versionId),
          projectId: new Types.ObjectId(projectId),
          userId: new Types.ObjectId(userId),
        }),
      ]);

      if (!project || !snapshotToRestore) {
        res.status(404).json({ success: false, error: 'Project or version snapshot not found' });
        return;
      }

      // Restore without destroying newer history: Create new version based on restored state
      const nextVersionNumber = project.currentVersion + 1;
      const restoreLabel = `Restored from v${snapshotToRestore.versionNumber} (${snapshotToRestore.versionName})`;

      const newVersion = await DesignVersion.create({
        projectId: project._id,
        userId: new Types.ObjectId(userId),
        versionNumber: nextVersionNumber,
        versionName: restoreLabel,
        documentData: snapshotToRestore.documentData,
        thumbnailUrl: snapshotToRestore.thumbnailUrl,
      });

      // Update project state
      project.documentData = snapshotToRestore.documentData;
      if (snapshotToRestore.thumbnailUrl) {
        project.thumbnailUrl = snapshotToRestore.thumbnailUrl;
      }
      project.currentVersion = nextVersionNumber;
      project.revision += 1;
      await project.save();

      res.json({
        success: true,
        restoredVersion: newVersion,
        project,
        message: `Successfully restored design to version ${snapshotToRestore.versionNumber}`,
      });
    } catch (err: any) {
      console.error('Restore version error:', err);
      res.status(500).json({ success: false, error: 'Failed to restore version' });
    }
  }
}
