export interface DedupeOptions {
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
  removeEmptyLines?: boolean;
}

export interface DedupeResult {
  text: string;
  originalLines: number;
  uniqueLines: number;
  removedCount: number;
}

/**
 * Removes duplicate lines with configurable sensitivity and preservation of first occurrence.
 */
export function removeDuplicateLines(text: string, options: DedupeOptions = {}): DedupeResult {
  if (!text) {
    return { text: '', originalLines: 0, uniqueLines: 0, removedCount: 0 };
  }

  const { caseSensitive = true, trimWhitespace = false, removeEmptyLines = false } = options;

  const rawLines = text.split(/\r\n|\r|\n/);
  const seen = new Set<string>();
  const output: string[] = [];

  for (const rawLine of rawLines) {
    let lineToCompare = rawLine;

    if (trimWhitespace) {
      lineToCompare = lineToCompare.trim();
    }

    if (removeEmptyLines && lineToCompare.length === 0) {
      continue;
    }

    const key = caseSensitive ? lineToCompare : lineToCompare.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      output.push(trimWhitespace ? lineToCompare : rawLine);
    }
  }

  const resultText = output.join('\n');
  const originalLines = rawLines.length;
  const uniqueLines = output.length;
  const removedCount = originalLines - uniqueLines;

  return {
    text: resultText,
    originalLines,
    uniqueLines,
    removedCount,
  };
}
