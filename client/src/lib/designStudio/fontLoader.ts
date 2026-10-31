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

/**
 * Dynamically loads a Google font into the document if not already loaded
 */
export async function loadFont(fontFamily: string): Promise<boolean> {
  if (loadedFonts.has(fontFamily)) {
    return true;
  }

  const fontConfig = AVAILABLE_FONTS.find((f) => f.family.toLowerCase() === fontFamily.toLowerCase());
  if (!fontConfig || !fontConfig.googleFont) {
    loadedFonts.add(fontFamily);
    return true;
  }

  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) {
    loadedFonts.add(fontFamily);
    return true;
  }

  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    const formattedName = fontFamily.replace(/\s+/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;600;700;900&display=swap`;

    link.onload = () => {
      loadedFonts.add(fontFamily);
      // Wait for font faces to be ready
      if ('fonts' in document) {
        document.fonts.ready.then(() => resolve(true));
      } else {
        resolve(true);
      }
    };

    link.onerror = () => {
      console.warn(`Could not load font: ${fontFamily}. Falling back to system default.`);
      resolve(false);
    };

    document.head.appendChild(link);
  });
}

/**
 * Preload essential fonts
 */
export function preloadCoreFonts(): void {
  ['Inter', 'Montserrat', 'Roboto', 'Playfair Display'].forEach(loadFont);
}
