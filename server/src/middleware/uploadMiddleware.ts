import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Unsupported file format. Please upload a valid JPEG, PNG, or WebP image.'));
      return;
    }
    cb(null, true);
  },
});

export const uploadImageAndMask = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Unsupported file format. Image and mask must be JPEG, PNG, or WebP.'));
      return;
    }
    cb(null, true);
  },
});

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB max
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Unsupported file format. Please upload a PDF or an image.'));
      return;
    }
    cb(null, true);
  },
});

/**
 * Validates real magic bytes of image buffer before passing to processing.
 */
export function validateImageMagicBytes(req: Request, res: Response, next: NextFunction): void {
  const file = req.file;
  if (!file || !file.buffer || file.buffer.length < 12) {
    res.status(400).json({ success: false, error: 'Please upload an image file.' });
    return;
  }

  const buf = file.buffer;
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isPng =
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a;
  const isWebp =
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50;

  if (!isJpeg && !isPng && !isWebp) {
    res.status(400).json({
      success: false,
      error: 'The uploaded file does not contain valid image data (magic bytes mismatch).',
    });
    return;
  }

  next();
}

export function validateDocMagicBytes(req: Request, res: Response, next: NextFunction): void {
  const file = req.file;
  if (!file || !file.buffer || file.buffer.length < 5) {
    next();
    return;
  }

  const buf = file.buffer;
  const isPdf =
    buf[0] === 0x25 && // %
    buf[1] === 0x50 && // P
    buf[2] === 0x44 && // D
    buf[3] === 0x46;   // F

  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isPng =
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47;

  if (!isPdf && !isJpeg && !isPng) {
    res.status(400).json({
      success: false,
      error: 'The uploaded document does not match recognized PDF or image magic bytes.',
    });
    return;
  }

  next();
}
