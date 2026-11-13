import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIController } from '../src/controllers/aiController.js';
import { AIJob } from '../src/models/AIJob.js';
import { StorageService } from '../src/services/storageService.js';
import { Types } from 'mongoose';

describe('AI Processing History Deletion API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deletes an individual processing history item and calls StorageService for cloud assets', async () => {
    const fakeJobId = new Types.ObjectId().toString();
    const fakeUserId = new Types.ObjectId().toString();

    const mockJob: any = {
      _id: new Types.ObjectId(fakeJobId),
      userId: new Types.ObjectId(fakeUserId),
      tool: 'ai-background-remover',
      outputUrl: '/api/design-assets/files/asset_user_processed123.png',
    };

    vi.spyOn(AIJob, 'findOne').mockResolvedValue(mockJob);
    vi.spyOn(AIJob, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);
    const deleteAssetSpy = vi.spyOn(StorageService, 'deleteAssetByUrl').mockResolvedValue(undefined);

    const req: any = {
      params: { id: fakeJobId },
      user: { userId: fakeUserId },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await AIController.deleteHistoryItem(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
    expect(deleteAssetSpy).toHaveBeenCalledWith(
      '/api/design-assets/files/asset_user_processed123.png',
    );
    expect(AIJob.deleteOne).toHaveBeenCalledWith({ _id: mockJob._id });
  });

  it('clears all processing history for the user and cleans up output assets', async () => {
    const fakeUserId = new Types.ObjectId().toString();
    const mockJobs: any[] = [
      {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(fakeUserId),
        outputUrl: '/api/design-assets/files/asset_1.png',
      },
      {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(fakeUserId),
        outputUrl: '/api/design-assets/files/asset_2.png',
      },
    ];

    vi.spyOn(AIJob, 'find').mockResolvedValue(mockJobs as any);
    vi.spyOn(AIJob, 'deleteMany').mockResolvedValue({ deletedCount: 2 } as any);
    const deleteAssetSpy = vi.spyOn(StorageService, 'deleteAssetByUrl').mockResolvedValue(undefined);

    const req: any = {
      user: { userId: fakeUserId },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await AIController.clearHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
    expect(deleteAssetSpy).toHaveBeenCalledTimes(2);
    expect(AIJob.deleteMany).toHaveBeenCalled();
  });
});
