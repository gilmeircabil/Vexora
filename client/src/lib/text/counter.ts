export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

/**
 * Accurately analyzes text statistics with Unicode support.
 */
export function analyzeText(text: string): TextStats {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    };
  }

  // Count grapheme clusters/characters safely
  const characters = Array.from(text).length;
  const charactersNoSpaces = Array.from(text.replace(/\s+/g, '')).length;

  // Words matching Unicode letters/digits sequences
  const wordsMatch = text.trim().match(/[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/gu);
  const words = wordsMatch ? wordsMatch.length : 0;

  // Lines: split by \r\n or \n
  const lines = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;

  // Paragraphs: non-empty chunks separated by one or more blank lines
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;

  // Average silent reading speed: ~225 wpm, speaking speed: ~140 wpm
  const readingTimeMinutes = Math.ceil(words / 225);
  const speakingTimeMinutes = Math.ceil(words / 140);

  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    paragraphs,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}
