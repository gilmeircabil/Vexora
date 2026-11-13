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

// Helper to convert a single color channel (0-255) to a 2-character hex string
function componentToHex(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  const hex = clamped.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

export function parseHexColor(hex: string): Result<RgbColor, string> {
  let clean = hex.trim();
  if (clean.startsWith('#')) {
    clean = clean.slice(1);
  }

  // Expand short 3 or 4 character hex: e.g. "abc" -> "aabbcc"
  if (clean.length === 3 || clean.length === 4) {
    let expanded = '';
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i] || '';
      expanded += char + char;
    }
    clean = expanded;
  }

  if (clean.length !== 6 && clean.length !== 8) {
    return err('Hex color must be 3, 4, 6, or 8 characters.');
  }

  // Check that all characters are valid hex digits
  if (!/^[0-9a-fA-F]+$/.test(clean)) {
    return err('Invalid hexadecimal characters.');
  }

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return err('Invalid hexadecimal characters.');
  }

  if (clean.length === 8) {
    const rawAlpha = parseInt(clean.slice(6, 8), 16);
    if (isNaN(rawAlpha)) {
      return err('Invalid hexadecimal characters.');
    }
    const a = Number((rawAlpha / 255).toFixed(2));
    return ok({ r, g, b, a });
  }

  return ok({ r, g, b, a: 1 });
}

export function rgbToHex({ r, g, b, a }: RgbColor): string {
  const redHex = componentToHex(r);
  const greenHex = componentToHex(g);
  const blueHex = componentToHex(b);

  if (a !== undefined && a < 1) {
    const alphaValue = Math.round(a * 255);
    const alphaHex = componentToHex(alphaValue);
    return `#${redHex}${greenHex}${blueHex}${alphaHex}`.toUpperCase();
  }

  return `#${redHex}${greenHex}${blueHex}`.toUpperCase();
}

export function rgbToHsl({ r, g, b, a }: RgbColor): HslColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    if (l > 0.5) {
      s = d / (2 - max - min);
    } else {
      s = d / (max + min);
    }

    if (max === rNorm) {
      h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / d + 2;
    } else {
      h = (rNorm - gNorm) / d + 4;
    }
    h = h / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a,
  };
}

function hueToRgb(p: number, q: number, t: number): number {
  let tempT = t;
  if (tempT < 0) tempT += 1;
  if (tempT > 1) tempT -= 1;

  if (tempT < 1 / 6) return p + (q - p) * 6 * tempT;
  if (tempT < 1 / 2) return q;
  if (tempT < 2 / 3) return p + (q - p) * (2 / 3 - tempT) * 6;
  return p;
}

export function hslToRgb({ h, s, l, a }: HslColor): RgbColor {
  const hNorm = (h % 360) / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val, a };
  }

  let q = 0;
  if (lNorm < 0.5) {
    q = lNorm * (1 + sNorm);
  } else {
    q = lNorm + sNorm - lNorm * sNorm;
  }
  const p = 2 * lNorm - q;

  const r = Math.round(hueToRgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, hNorm) * 255);
  const b = Math.round(hueToRgb(p, q, hNorm - 1 / 3) * 255);

  return { r, g, b, a };
}

/**
 * Calculates WCAG relative luminance (0 to 1).
 */
export function getRelativeLuminance({ r, g, b }: RgbColor): number {
  function toLinear(v: number): number {
    const c = v / 255;
    if (c <= 0.03928) {
      return c / 12.92;
    }
    return Math.pow((c + 0.055) / 1.055, 2.4);
  }

  const redLinear = toLinear(r);
  const greenLinear = toLinear(g);
  const blueLinear = toLinear(b);

  return 0.2126 * redLinear + 0.7152 * greenLinear + 0.0722 * blueLinear;
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
