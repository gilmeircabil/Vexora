import QRCode from 'qrcode';
import { Result, ok, err } from '../result.js';

export interface QrCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

export async function generateQrPng(
  text: string,
  options: QrCodeOptions = {},
): Promise<Result<string, string>> {
  if (!text || text.trim().length === 0) {
    return err('Input content cannot be empty.');
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      width: options.width || 300,
      margin: options.margin !== undefined ? options.margin : 2,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#ffffff',
      },
    });
    return ok(dataUrl);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Failed to generate QR code PNG.');
  }
}

export async function generateQrSvg(
  text: string,
  options: QrCodeOptions = {},
): Promise<Result<string, string>> {
  if (!text || text.trim().length === 0) {
    return err('Input content cannot be empty.');
  }

  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      width: options.width || 300,
      margin: options.margin !== undefined ? options.margin : 2,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#ffffff',
      },
    });
    return ok(svgString);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Failed to generate QR code SVG.');
  }
}
