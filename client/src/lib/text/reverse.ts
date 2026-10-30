/**
 * Reverses text safely without breaking Unicode surrogate pairs or combining characters.
 * Uses Intl.Segmenter if supported, or Array.from fallback.
 */
export function reverseText(text: string, mode: 'characters' | 'words' = 'characters'): string {
  if (!text) return '';

  if (mode === 'words') {
    // Reverse word order while maintaining newline structure
    const lines = text.split('\n');
    return lines
      .map((line) => {
        const words = line.split(/(\s+)/);
        return words.reverse().join('');
      })
      .join('\n');
  }

  // Character reversal with grapheme cluster preservation
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    const graphemes = Array.from(segmenter.segment(text), (s) => s.segment);
    return graphemes.reverse().join('');
  }

  // Fallback for environments without Intl.Segmenter
  return Array.from(text).reverse().join('');
}
