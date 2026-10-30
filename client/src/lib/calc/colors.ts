import { Result, ok, err } from '../result.js';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface HslColor {
  h: number; // 0 - 360
  s: number; // 0 - 100 (%)
  l: number; // 0 - 100 (%)
  a?: number;
}

export function parseHexColor(hex: string): Result<RgbColor, string> {
  let clean = hex.trim();
  if (clean.startsWith('#')) clean = clean.slice(1);

  if (clean.length === 3 || clean.length === 4) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (clean.length !== 6 && clean.length !== 8) {
    return err('Hex color must be 3, 4, 6, or 8 characters.');
  }

  const num = parseInt(clean, 16);
  if (isNaN(num)) {
    return err('Invalid hexadecimal characters.');
  }

  if (clean.length === 8) {
    return ok({
      r: (num >> 24) & 255,
      g: (num >> 16) & 255,
      b: (num >> 8) & 255,
      a: Number(((num & 255) / 255).toFixed(2)),
    });
  }

  return ok({
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    a: 1,
  });
}

export function rgbToHex({ r, g, b, a }: RgbColor): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');

  if (a !== undefined && a < 1) {
    const alphaHex = Math.round(a * 255)
      .toString(16)
      .padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`.toUpperCase();
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b, a }: RgbColor): HslColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a,
  };
}

export function hslToRgb({ h, s, l, a }: HslColor): RgbColor {
  const hNorm = (h % 360) / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val, a };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
    a,
  };
}

/**
 * Calculates WCAG relative luminance (0 to 1).
 */
export function getRelativeLuminance({ r, g, b }: RgbColor): number {
  const toLinear = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculates WCAG contrast ratio (1:1 to 21:1).
 */
export function getContrastRatio(rgb1: RgbColor, rgb2: RgbColor): number {
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}
