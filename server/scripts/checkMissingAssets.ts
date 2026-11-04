import fsSync from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../src/config/env.js';
import { DesignAsset } from '../src/models/DesignAsset.js';
import { DesignProject } from '../src/models/DesignProject.js';
import { DesignVersion } from '../src/models/DesignVersion.js';

interface MissingAssetRecord {
  assetId: string;
  userId: string;
  projectId?: string;
  originalName: string;
  storageKey: string;
  url: string;
  createdAt: string;
}

interface BrokenProjectReference {
  projectId: string;
  projectTitle: string;
  userId: string;
  referenceType: 'thumbnail' | 'canvas_object';
  storageKeyOrUrl: string;
}

interface BrokenVersionReference {
  versionId: string;
  projectId: string;
  versionNumber: number;
  versionName: string;
  referenceType: 'thumbnail' | 'canvas_object';
  storageKeyOrUrl: string;
}

// Storage setup
const uploadsAssetsDir = path.resolve(process.cwd(), 'server', 'uploads', 'assets');
const uploadsThumbsDir = path.resolve(process.cwd(), 'server', 'uploads', 'assets', 'thumbs');

let s3Client: S3Client | null = null;
const isS3Configured = env.STORAGE_PROVIDER === 's3' && Boolean(env.S3_BUCKET);

if (isS3Configured) {
  s3Client = new S3Client({
    region: env.S3_REGION || 'auto',
    endpoint: env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY || '',
      secretAccessKey: env.S3_SECRET_KEY || '',
    },
  });
}

function extractKeyFromUrl(urlOrPath: string): { key: string; isThumb: boolean } | null {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null;

  // Match /api/design-assets/files/thumbs/:key or /thumbs/:key
  const thumbMatch = urlOrPath.match(/(?:\/api\/design-assets\/files\/thumbs\/|\/thumbs\/)(asset_[a-f0-9_.]+|thumb_[a-f0-9_.]+)/i);
  if (thumbMatch) {
    return { key: thumbMatch[1], isThumb: true };
  }

  // Match /api/design-assets/files/:key or /assets/:key
  const assetMatch = urlOrPath.match(/(?:\/api\/design-assets\/files\/|\/assets\/)(asset_[a-f0-9_.]+)/i);
  if (assetMatch) {
    return { key: assetMatch[1], isThumb: false };
  }

  // Direct asset key string
  if (/^asset_[a-f0-9_.]+$/i.test(urlOrPath)) {
    return { key: urlOrPath, isThumb: false };
  }
  if (/^thumb_[a-f0-9_.]+$/i.test(urlOrPath)) {
    return { key: urlOrPath, isThumb: true };
  }

  return null;
}

async function checkStorageExists(storageKey: string, isThumb = false): Promise<boolean> {
  const candidateKeys = [storageKey];
  if (isThumb && storageKey.startsWith('asset_')) {
    candidateKeys.unshift(storageKey.replace(/^asset_/, 'thumb_').replace(/\.[^.]+$/, '.webp'));
  }

  // 1. Check Cloudflare R2 / S3 if configured
  if (isS3Configured && s3Client) {
    for (const key of candidateKeys) {
      const s3Key = isThumb ? `thumbs/${key}` : `assets/${key}`;
      try {
        await s3Client.send(
          new HeadObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: s3Key,
          }),
        );
        return true;
      } catch {
        // Continue checking next candidate or local fallback
      }
    }
  }

  // 2. Check local uploads directory
  for (const key of candidateKeys) {
    const localDir = isThumb ? uploadsThumbsDir : uploadsAssetsDir;
    const localPath = path.join(localDir, key);
    if (fsSync.existsSync(localPath)) {
      return true;
    }
  }

  return false;
}

function findImageUrlsInDocument(documentData: any): string[] {
  const urls: string[] = [];
  if (!documentData || typeof documentData !== 'object') return urls;

  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    if (obj.src && typeof obj.src === 'string') {
      urls.push(obj.src);
    }

    if (Array.isArray(obj.objects)) {
      for (const child of obj.objects) {
        traverse(child);
      }
    }
  }

  traverse(documentData);
  return urls;
}

async function runAudit() {
  console.log('================================================================');
  console.log('🔍 Vexora Design Assets Diagnostic Check (READ-ONLY)');
  console.log('================================================================');
  console.log(`- Database URI: ${env.MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@')}`);
  console.log(`- Storage Provider: ${env.STORAGE_PROVIDER}`);
  console.log(`- S3 / R2 Bucket: ${env.S3_BUCKET || '(none configured)'}`);
  console.log(`- Local Storage Dir: ${uploadsAssetsDir}`);
  console.log('----------------------------------------------------------------\n');

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
  } catch (err: any) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const missingAssets: MissingAssetRecord[] = [];
  const brokenProjects: BrokenProjectReference[] = [];
  const brokenVersions: BrokenVersionReference[] = [];

  // 1. Audit DesignAsset Collection
  console.log('⏳ Checking DesignAsset records in storage...');
  const allAssets = await DesignAsset.find().lean();
  console.log(`Found ${allAssets.length} DesignAsset record(s) in database.`);

  for (const asset of allAssets) {
    const exists = await checkStorageExists(asset.storageKey, false);
    if (!exists) {
      missingAssets.push({
        assetId: String(asset._id),
        userId: String(asset.userId),
        projectId: asset.projectId ? String(asset.projectId) : undefined,
        originalName: asset.originalName,
        storageKey: asset.storageKey,
        url: asset.url,
        createdAt: asset.createdAt ? new Date(asset.createdAt).toISOString() : 'unknown',
      });
    }
  }

  // 2. Audit DesignProject Collection
  console.log('⏳ Checking DesignProject records (thumbnails & canvas objects)...');
  const allProjects = await DesignProject.find().lean();
  console.log(`Found ${allProjects.length} DesignProject record(s) in database.`);

  for (const proj of allProjects) {
    // Check thumbnail
    if (proj.thumbnailUrl) {
      const extracted = extractKeyFromUrl(proj.thumbnailUrl);
      if (extracted) {
        const exists = await checkStorageExists(extracted.key, extracted.isThumb);
        if (!exists) {
          brokenProjects.push({
            projectId: String(proj._id),
            projectTitle: proj.title,
            userId: String(proj.userId),
            referenceType: 'thumbnail',
            storageKeyOrUrl: proj.thumbnailUrl,
          });
        }
      }
    }

    // Check canvas document data objects
    const canvasUrls = findImageUrlsInDocument(proj.documentData);
    for (const url of canvasUrls) {
      const extracted = extractKeyFromUrl(url);
      if (extracted) {
        const exists = await checkStorageExists(extracted.key, extracted.isThumb);
        if (!exists) {
          brokenProjects.push({
            projectId: String(proj._id),
            projectTitle: proj.title,
            userId: String(proj.userId),
            referenceType: 'canvas_object',
            storageKeyOrUrl: url,
          });
        }
      }
    }
  }

  // 3. Audit DesignVersion Collection
  console.log('⏳ Checking DesignVersion snapshots...');
  const allVersions = await DesignVersion.find().lean();
  console.log(`Found ${allVersions.length} DesignVersion record(s) in database.`);

  for (const ver of allVersions) {
    if (ver.thumbnailUrl) {
      const extracted = extractKeyFromUrl(ver.thumbnailUrl);
      if (extracted) {
        const exists = await checkStorageExists(extracted.key, extracted.isThumb);
        if (!exists) {
          brokenVersions.push({
            versionId: String(ver._id),
            projectId: String(ver.projectId),
            versionNumber: ver.versionNumber,
            versionName: ver.versionName,
            referenceType: 'thumbnail',
            storageKeyOrUrl: ver.thumbnailUrl,
          });
        }
      }
    }

    const canvasUrls = findImageUrlsInDocument(ver.documentData);
    for (const url of canvasUrls) {
      const extracted = extractKeyFromUrl(url);
      if (extracted) {
        const exists = await checkStorageExists(extracted.key, extracted.isThumb);
        if (!exists) {
          brokenVersions.push({
            versionId: String(ver._id),
            projectId: String(ver.projectId),
            versionNumber: ver.versionNumber,
            versionName: ver.versionName,
            referenceType: 'canvas_object',
            storageKeyOrUrl: url,
          });
        }
      }
    }
  }

  // Results Output
  console.log('\n================================================================');
  console.log('📊 AUDIT SUMMARY REPORT');
  console.log('================================================================');
  console.log(`- Total DesignAsset records:   ${allAssets.length}`);
  console.log(`- Missing storage assets:       ${missingAssets.length}`);
  console.log(`- Broken project references:   ${brokenProjects.length}`);
  console.log(`- Broken version references:   ${brokenVersions.length}`);
  console.log('----------------------------------------------------------------\n');

  if (missingAssets.length > 0) {
    console.log('⚠️  MISSING DESIGN ASSETS (Found in DB, Missing in Storage):');
    console.table(
      missingAssets.map((a) => ({
        AssetId: a.assetId,
        Name: a.originalName,
        StorageKey: a.storageKey,
        Created: a.createdAt,
      })),
    );
  } else {
    console.log('✓ No missing DesignAsset records found.');
  }

  if (brokenProjects.length > 0) {
    console.log('\n⚠️  DESIGN PROJECTS REFERENCING MISSING ASSETS:');
    console.table(
      brokenProjects.map((p) => ({
        ProjectId: p.projectId,
        Title: p.projectTitle,
        RefType: p.referenceType,
        KeyOrUrl: p.storageKeyOrUrl.length > 60 ? '...' + p.storageKeyOrUrl.slice(-57) : p.storageKeyOrUrl,
      })),
    );
  } else {
    console.log('✓ No broken references found in DesignProjects.');
  }

  if (brokenVersions.length > 0) {
    console.log('\n⚠️  DESIGN VERSIONS REFERENCING MISSING ASSETS:');
    console.table(
      brokenVersions.map((v) => ({
        VersionId: v.versionId,
        ProjectId: v.projectId,
        Version: `v${v.versionNumber} (${v.versionName})`,
        RefType: v.referenceType,
        KeyOrUrl: v.storageKeyOrUrl.length > 60 ? '...' + v.storageKeyOrUrl.slice(-57) : v.storageKeyOrUrl,
      })),
    );
  } else {
    console.log('✓ No broken references found in DesignVersions.');
  }

  console.log('\n================================================================');
  console.log('🛡️  NOTICE: THIS SCRIPT IS READ-ONLY.');
  console.log('No database records or files have been deleted or modified.');
  console.log('To clean up or re-link missing references, review the table above.');
  console.log('================================================================\n');

  await mongoose.disconnect();
}

runAudit().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
