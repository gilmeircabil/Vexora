import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { DesignTemplate } from '../models/DesignTemplate.js';
import { DesignProject } from '../models/DesignProject.js';
import { DesignVersion } from '../models/DesignVersion.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

function getParam(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

export const INITIAL_SEED_TEMPLATES = [
  {
    title: 'Modern Product Launch Post',
    description:
      'Vibrant Neo-Brutalist product announcement template for Instagram and social media.',
    category: 'social-media',
    width: 1080,
    height: 1080,
    thumbnailUrl: '',
    isPublic: true,
    documentData: {
      version: '7.4.0',
      background: '#FAF7F2',
      objects: [
        {
          type: 'Rect',
          left: 40,
          top: 40,
          width: 1000,
          height: 1000,
          fill: '#FACC15',
          stroke: '#000000',
          strokeWidth: 4,
          rx: 24,
          ry: 24,
          shadow: { color: '#000000', blur: 0, offsetX: 12, offsetY: 12 },
        },
        {
          type: 'Rect',
          left: 100,
          top: 100,
          width: 880,
          height: 880,
          fill: '#FFFFFF',
          stroke: '#000000',
          strokeWidth: 3,
          rx: 16,
          ry: 16,
        },
        {
          type: 'Textbox',
          left: 150,
          top: 160,
          width: 780,
          text: 'NEW RELEASE',
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'Montserrat',
          fill: '#EA580C',
          textAlign: 'center',
          charSpacing: 80,
        },
        {
          type: 'Textbox',
          left: 150,
          top: 240,
          width: 780,
          text: 'DESIGN STUDIO\nIS HERE',
          fontSize: 72,
          fontWeight: '900',
          fontFamily: 'Montserrat',
          fill: '#000000',
          textAlign: 'center',
          lineHeight: 1.1,
        },
        {
          type: 'Rect',
          left: 340,
          top: 460,
          width: 400,
          height: 8,
          fill: '#000000',
        },
        {
          type: 'Textbox',
          left: 180,
          top: 520,
          width: 720,
          text: 'Create high-impact graphics, social banners, and marketing assets in seconds right inside VexoraMods Studio.',
          fontSize: 28,
          fontFamily: 'Inter',
          fill: '#374151',
          textAlign: 'center',
          lineHeight: 1.4,
        },
        {
          type: 'Rect',
          left: 360,
          top: 720,
          width: 360,
          height: 80,
          fill: '#2563EB',
          stroke: '#000000',
          strokeWidth: 3,
          rx: 12,
          ry: 12,
          shadow: { color: '#000000', blur: 0, offsetX: 6, offsetY: 6 },
        },
        {
          type: 'Textbox',
          left: 360,
          top: 742,
          width: 360,
          text: 'TRY IT TODAY →',
          fontSize: 26,
          fontWeight: 'bold',
          fontFamily: 'Montserrat',
          fill: '#FFFFFF',
          textAlign: 'center',
        },
      ],
    },
  },
  {
    title: 'YouTube Tech Thumbnail',
    description: 'Bold high-contrast thumbnail designed for maximum click-through rate.',
    category: 'youtube',
    width: 1280,
    height: 720,
    thumbnailUrl: '',
    isPublic: true,
    documentData: {
      version: '7.4.0',
      background: '#0F172A',
      objects: [
        {
          type: 'Rect',
          left: 60,
          top: 60,
          width: 700,
          height: 600,
          fill: '#FACC15',
          stroke: '#000000',
          strokeWidth: 6,
          rx: 20,
          ry: 20,
          shadow: { color: '#000000', blur: 0, offsetX: 16, offsetY: 16 },
        },
        {
          type: 'Textbox',
          left: 100,
          top: 120,
          width: 620,
          text: 'THE ULTIMATE\nDESIGN GUIDE',
          fontSize: 64,
          fontWeight: '900',
          fontFamily: 'Montserrat',
          fill: '#000000',
          lineHeight: 1.1,
        },
        {
          type: 'Rect',
          left: 100,
          top: 320,
          width: 340,
          height: 64,
          fill: '#DC2626',
          stroke: '#000000',
          strokeWidth: 3,
          rx: 10,
          ry: 10,
        },
        {
          type: 'Textbox',
          left: 100,
          top: 335,
          width: 340,
          text: '100% FREE TOOLS',
          fontSize: 26,
          fontWeight: 'bold',
          fontFamily: 'Montserrat',
          fill: '#FFFFFF',
          textAlign: 'center',
        },
        {
          type: 'Circle',
          left: 880,
          top: 140,
          radius: 180,
          fill: '#38BDF8',
          stroke: '#000000',
          strokeWidth: 6,
          shadow: { color: '#000000', blur: 0, offsetX: 12, offsetY: 12 },
        },
        {
          type: 'Textbox',
          left: 880,
          top: 270,
          width: 360,
          text: '4K\nREADY',
          fontSize: 64,
          fontWeight: '900',
          fontFamily: 'Montserrat',
          fill: '#000000',
          textAlign: 'center',
          lineHeight: 1.1,
        },
      ],
    },
  },
  {
    title: 'Startup Pitch Slide',
    description: 'Clean modern presentation deck template for startups and pitch decks.',
    category: 'presentations',
    width: 1920,
    height: 1080,
    thumbnailUrl: '',
    isPublic: true,
    documentData: {
      version: '7.4.0',
      background: '#FFFFFF',
      objects: [
        {
          type: 'Rect',
          left: 100,
          top: 80,
          width: 1720,
          height: 120,
          fill: '#FAF7F2',
          stroke: '#000000',
          strokeWidth: 3,
          rx: 12,
          ry: 12,
        },
        {
          type: 'Textbox',
          left: 140,
          top: 110,
          width: 600,
          text: 'VEXORAMODS // EXECUTIVE BRIEF',
          fontSize: 34,
          fontWeight: 'bold',
          fontFamily: 'Montserrat',
          fill: '#000000',
        },
        {
          type: 'Textbox',
          left: 120,
          top: 300,
          width: 1000,
          text: 'Accelerating Digital Creators With Open Tools',
          fontSize: 76,
          fontWeight: '900',
          fontFamily: 'Montserrat',
          fill: '#000000',
          lineHeight: 1.15,
        },
        {
          type: 'Textbox',
          left: 120,
          top: 540,
          width: 1000,
          text: 'Unifying design editors, PDF converters, image manipulation algorithms, and developer utilities in one unified client-first workspace.',
          fontSize: 36,
          fontFamily: 'Inter',
          fill: '#4B5563',
          lineHeight: 1.4,
        },
        {
          type: 'Rect',
          left: 1240,
          top: 280,
          width: 580,
          height: 620,
          fill: '#10B981',
          stroke: '#000000',
          strokeWidth: 4,
          rx: 24,
          ry: 24,
          shadow: { color: '#000000', blur: 0, offsetX: 16, offsetY: 16 },
        },
        {
          type: 'Textbox',
          left: 1280,
          top: 360,
          width: 500,
          text: 'KEY METRICS',
          fontSize: 36,
          fontWeight: 'bold',
          fontFamily: 'Montserrat',
          fill: '#000000',
        },
        {
          type: 'Textbox',
          left: 1280,
          top: 480,
          width: 500,
          text: '• 32+ Integrated Tools\n• 100% Free Core Engine\n• Zero Setup Required\n• Local-First Privacy',
          fontSize: 32,
          fontFamily: 'Inter',
          fill: '#000000',
          lineHeight: 1.6,
        },
      ],
    },
  },
  {
    title: 'Minimalist Business Card',
    description: 'Sleek horizontal business card with high-end typography and clear hierarchy.',
    category: 'business',
    width: 1050,
    height: 600,
    thumbnailUrl: '',
    isPublic: true,
    documentData: {
      version: '7.4.0',
      background: '#18181B',
      objects: [
        {
          type: 'Rect',
          left: 30,
          top: 30,
          width: 990,
          height: 540,
          fill: '#27272A',
          stroke: '#FACC15',
          strokeWidth: 3,
          rx: 16,
          ry: 16,
        },
        {
          type: 'Textbox',
          left: 80,
          top: 120,
          width: 700,
          text: 'ALEXANDER MORGAN',
          fontSize: 48,
          fontWeight: 'bold',
          fontFamily: 'Montserrat',
          fill: '#FFFFFF',
          charSpacing: 60,
        },
        {
          type: 'Textbox',
          left: 80,
          top: 190,
          width: 700,
          text: 'Lead Product Designer & Creative Engineer',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#FACC15',
        },
        {
          type: 'Line',
          x1: 80,
          y1: 260,
          x2: 500,
          y2: 260,
          stroke: '#52525B',
          strokeWidth: 2,
        },
        {
          type: 'Textbox',
          left: 80,
          top: 320,
          width: 800,
          text: 'hello@vexoramods.design  |  +1 (555) 019-2834\nwww.vexoramods.design  |  San Francisco, CA',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#A1A1AA',
          lineHeight: 1.6,
        },
      ],
    },
  },
  {
    title: 'Instagram Story Sale Announcement',
    description: 'Vertical 9:16 layout optimized for mobile social stories and reels cover.',
    category: 'social-media',
    width: 1080,
    height: 1920,
    thumbnailUrl: '',
    isPublic: true,
    documentData: {
      version: '7.4.0',
      background: '#FEF08A',
      objects: [
        {
          type: 'Rect',
          left: 60,
          top: 120,
          width: 960,
          height: 1680,
          fill: '#FFFFFF',
          stroke: '#000000',
          strokeWidth: 6,
          rx: 28,
          ry: 28,
          shadow: { color: '#000000', blur: 0, offsetX: 16, offsetY: 16 },
        },
        {
          type: 'Rect',
          left: 340,
          top: 220,
          width: 400,
          height: 60,
          fill: '#EF4444',
          stroke: '#000000',
          strokeWidth: 3,
          rx: 10,
          ry: 10,
        },
        {
          type: 'Textbox',
          left: 340,
          top: 235,
          width: 400,
          text: 'FLASH SALE',
          fontSize: 28,
          fontWeight: '900',
          fontFamily: 'Montserrat',
          fill: '#FFFFFF',
          textAlign: 'center',
          charSpacing: 80,
        },
        {
          type: 'Textbox',
          left: 120,
          top: 380,
          width: 840,
          text: 'UP TO\n50% OFF',
          fontSize: 120,
          fontWeight: '900',
          fontFamily: 'Montserrat',
          fill: '#000000',
          textAlign: 'center',
          lineHeight: 1.05,
        },
        {
          type: 'Circle',
          left: 390,
          top: 800,
          radius: 150,
          fill: '#A855F7',
          stroke: '#000000',
          strokeWidth: 5,
          shadow: { color: '#000000', blur: 0, offsetX: 10, offsetY: 10 },
        },
        {
          type: 'Textbox',
          left: 390,
          top: 920,
          width: 300,
          text: 'THIS\nWEEKEND',
          fontSize: 34,
          fontWeight: 'bold',
          fontFamily: 'Montserrat',
          fill: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 1.2,
        },
        {
          type: 'Textbox',
          left: 120,
          top: 1300,
          width: 840,
          text: 'Use code VEXORAMODS50 at checkout',
          fontSize: 34,
          fontWeight: 'bold',
          fontFamily: 'Inter',
          fill: '#000000',
          textAlign: 'center',
        },
        {
          type: 'Rect',
          left: 240,
          top: 1480,
          width: 600,
          height: 100,
          fill: '#000000',
          rx: 16,
          ry: 16,
        },
        {
          type: 'Textbox',
          left: 240,
          top: 1515,
          width: 600,
          text: 'SWIPE UP TO SHOP',
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'Montserrat',
          fill: '#FACC15',
          textAlign: 'center',
        },
      ],
    },
  },
  {
    title: 'Event Concert Poster',
    description: 'High-energy typographic flyer for music festivals, live gigs, and conferences.',
    category: 'events',
    width: 1200,
    height: 1600,
    thumbnailUrl: '',
    isPublic: true,
    documentData: {
      version: '7.4.0',
      background: '#09090B',
      objects: [
        {
          type: 'Rect',
          left: 50,
          top: 50,
          width: 1100,
          height: 1500,
          fill: '#18181B',
          stroke: '#EC4899',
          strokeWidth: 4,
          rx: 16,
          ry: 16,
        },
        {
          type: 'Textbox',
          left: 100,
          top: 160,
          width: 1000,
          text: 'VEXORAMODS FESTIVAL',
          fontSize: 72,
          fontWeight: '900',
          fontFamily: 'Montserrat',
          fill: '#EC4899',
          textAlign: 'center',
          charSpacing: 60,
        },
        {
          type: 'Textbox',
          left: 100,
          top: 300,
          width: 1000,
          text: 'LIVE MUSIC & ART SUMMIT',
          fontSize: 36,
          fontWeight: 'bold',
          fontFamily: 'Inter',
          fill: '#FFFFFF',
          textAlign: 'center',
        },
        {
          type: 'Rect',
          left: 200,
          top: 420,
          width: 800,
          height: 4,
          fill: '#FACC15',
        },
        {
          type: 'Textbox',
          left: 100,
          top: 520,
          width: 1000,
          text: 'FEATURING HEADLINERS',
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'Montserrat',
          fill: '#FACC15',
          textAlign: 'center',
          charSpacing: 40,
        },
        {
          type: 'Textbox',
          left: 100,
          top: 640,
          width: 1000,
          text: 'SOLAR PULSE\nECHO FREQUENCY\nNEON HORIZON\nTHE SYNTH COLLECTIVE',
          fontSize: 52,
          fontWeight: '900',
          fontFamily: 'Montserrat',
          fill: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 1.4,
        },
        {
          type: 'Textbox',
          left: 100,
          top: 1100,
          width: 1000,
          text: 'NOVEMBER 15-17  •  METROPOLIS ARENA',
          fontSize: 36,
          fontWeight: 'bold',
          fontFamily: 'Inter',
          fill: '#A1A1AA',
          textAlign: 'center',
        },
        {
          type: 'Rect',
          left: 350,
          top: 1260,
          width: 500,
          height: 90,
          fill: '#EC4899',
          stroke: '#FFFFFF',
          strokeWidth: 2,
          rx: 14,
          ry: 14,
        },
        {
          type: 'Textbox',
          left: 350,
          top: 1290,
          width: 500,
          text: 'GET TICKETS NOW',
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'Montserrat',
          fill: '#FFFFFF',
          textAlign: 'center',
        },
      ],
    },
  },
];

export class DesignTemplateController {
  /**
   * List templates (with auto-seeding if collection is empty)
   * Route: GET /api/design-templates
   */
  static async listTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { category, search } = req.query;

      // Check if we need to seed
      const count = await DesignTemplate.countDocuments();
      if (count === 0) {
        await DesignTemplate.insertMany(INITIAL_SEED_TEMPLATES);
      }

      const query: Record<string, any> = { isPublic: true };

      if (category && typeof category === 'string' && category !== 'all') {
        query.category = category.toLowerCase();
      }

      if (search && typeof search === 'string' && search.trim()) {
        query.title = { $regex: search.trim(), $options: 'i' };
      }

      const templates = await DesignTemplate.find(query).sort({ createdAt: 1 }).lean();

      res.json({
        success: true,
        templates,
      });
    } catch (err: any) {
      console.error('List templates error:', err);
      res.status(500).json({ success: false, error: 'Failed to list design templates' });
    }
  }

  /**
   * Get single template
   * Route: GET /api/design-templates/:templateId
   */
  static async getTemplate(req: Request, res: Response): Promise<void> {
    try {
      const templateId = getParam(req.params.templateId);

      if (!templateId || !Types.ObjectId.isValid(templateId)) {
        res.status(400).json({ success: false, error: 'Invalid template ID' });
        return;
      }

      const template = await DesignTemplate.findById(templateId);
      if (!template) {
        res.status(404).json({ success: false, error: 'Template not found' });
        return;
      }

      res.json({
        success: true,
        template,
      });
    } catch (err: any) {
      console.error('Get template error:', err);
      res.status(500).json({ success: false, error: 'Failed to get template' });
    }
  }

  /**
   * Use template: creates a new editable project for the authenticated user
   * Route: POST /api/design-templates/:templateId/use
   */
  static async useTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const templateId = getParam(req.params.templateId);

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      if (!templateId || !Types.ObjectId.isValid(templateId)) {
        res.status(400).json({ success: false, error: 'Invalid template ID' });
        return;
      }

      const template = await DesignTemplate.findById(templateId);
      if (!template) {
        res.status(404).json({ success: false, error: 'Template not found' });
        return;
      }

      // Clone documentData so modifications don't mutate template
      const clonedDoc = JSON.parse(JSON.stringify(template.documentData));

      const project = await DesignProject.create({
        userId: new Types.ObjectId(userId),
        title: `${template.title} (Project)`,
        description: template.description,
        width: template.width,
        height: template.height,
        background: clonedDoc.background || '#ffffff',
        category: template.category,
        documentData: clonedDoc,
        thumbnailUrl: template.thumbnailUrl,
        currentVersion: 1,
        revision: 1,
        isStarred: false,
      });

      await DesignVersion.create({
        projectId: project._id,
        userId: new Types.ObjectId(userId),
        versionNumber: 1,
        versionName: `Created from template: ${template.title}`,
        documentData: clonedDoc,
        thumbnailUrl: project.thumbnailUrl,
      });

      res.status(201).json({
        success: true,
        project,
        message: 'Template instantiated into project successfully',
      });
    } catch (err: any) {
      console.error('Use template error:', err);
      res.status(500).json({ success: false, error: 'Failed to use template' });
    }
  }
}
