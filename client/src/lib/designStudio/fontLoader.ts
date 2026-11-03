import { cache } from 'fabric';

export interface FontOption {
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  googleFont: boolean;
}

export const AVAILABLE_FONTS: FontOption[] = [
  { family: 'Inter', category: 'sans-serif', googleFont: true },
  { family: 'Montserrat', category: 'sans-serif', googleFont: true },
  { family: 'Roboto', category: 'sans-serif', googleFont: true },
  { family: 'Open Sans', category: 'sans-serif', googleFont: true },
  { family: 'Poppins', category: 'sans-serif', googleFont: true },
  { family: 'Playfair Display', category: 'serif', googleFont: true },
  { family: 'Merriweather', category: 'serif', googleFont: true },
  { family: 'Oswald', category: 'sans-serif', googleFont: true },
  { family: 'Lobster', category: 'display', googleFont: true },
  { family: 'Pacifico', category: 'handwriting', googleFont: true },
  { family: 'Dancing Script', category: 'handwriting', googleFont: true },
  { family: 'Courier Prime', category: 'monospace', googleFont: true },
  { family: 'Impact', category: 'display', googleFont: false },
  { family: 'Arial', category: 'sans-serif', googleFont: false },
  { family: 'Georgia', category: 'serif', googleFont: false },
  { family: 'Times New Roman', category: 'serif', googleFont: false },
  { family: 'Courier New', category: 'monospace', googleFont: false },
];

const loadedFonts = new Set<string>();
const inFlightFonts = new Map<string, Promise<boolean>>();

/**
 * Dynamically loads a Google font into the document if not already loaded
 */
export async function loadFont(fontFamily: string): Promise<boolean> {
  const normalizedKey = fontFamily.trim().toLowerCase();
  if (loadedFonts.has(normalizedKey)) {
    return true;
  }

  const existingPromise = inFlightFonts.get(normalizedKey);
  if (existingPromise) {
    return existingPromise;
  }

  const fontConfig = AVAILABLE_FONTS.find((f) => f.family.toLowerCase() === normalizedKey);
  if (!fontConfig || !fontConfig.googleFont) {
    loadedFonts.add(normalizedKey);
    return true;
  }

  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) {
    loadedFonts.add(normalizedKey);
    cache.clearFontCache(fontFamily);
    return true;
  }

  const loadPromise = new Promise<boolean>((resolve) => {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    const formattedName = fontFamily.replace(/\s+/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;600;700;900&display=swap`;

    const finalize = (ok: boolean) => {
      inFlightFonts.delete(normalizedKey);
      if (ok) {
        loadedFonts.add(normalizedKey);
        cache.clearFontCache(fontFamily);
      }
      resolve(ok);
    };

    link.onload = () => {
      if ('fonts' in document && typeof document.fonts.load === 'function') {
        Promise.allSettled([
          document.fonts.load(`400 16px "${fontFamily}"`),
          document.fonts.load(`700 16px "${fontFamily}"`),
        ]).then(() => finalize(true));
      } else if ('fonts' in document && document.fonts.ready) {
        document.fonts.ready.then(() => finalize(true));
      } else {
        finalize(true);
      }
    };

    link.onerror = () => {
      console.warn(`Could not load font: ${fontFamily}. Falling back to system default.`);
      finalize(false);
    };

    document.head.appendChild(link);
  });

  inFlightFonts.set(normalizedKey, loadPromise);
  return loadPromise;
}

/**
 * Preload essential fonts
 */
export function preloadCoreFonts(): void {
  ['Inter', 'Montserrat', 'Roboto', 'Playfair Display'].forEach(loadFont);
}
