import { Result, ok, err } from '../result.js';

export interface JsonFormatOptions {
  indent: number | '\t';
  sortKeys?: boolean;
}

export interface JsonSyntaxErrorDetail {
  message: string;
  line?: number;
  column?: number;
}

function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = sortJsonKeys((value as Record<string, unknown>)[key]);
          return acc;
        },
        {} as Record<string, unknown>,
      );
  }
  return value;
}

/**
 * Extracts line and column from JSON.parse error message if available.
 */
function extractErrorPosition(errorMsg: string, input: string): { line?: number; column?: number } {
  // Typical formats: "at position 42", "line 3 column 5"
  const lineColMatch = errorMsg.match(/line (\d+) column (\d+)/i);
  if (lineColMatch && lineColMatch[1] && lineColMatch[2]) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  const posMatch = errorMsg.match(/at position (\d+)/i);
  if (posMatch && posMatch[1]) {
    const pos = parseInt(posMatch[1], 10);
    const before = input.slice(0, pos);
    const lines = before.split('\n');
    return {
      line: lines.length,
      column: (lines[lines.length - 1]?.length ?? 0) + 1,
    };
  }

  return {};
}

/**
 * Parses, validates, and formats JSON without using eval or Function constructor.
 */
export function formatJson(
  input: string,
  options: JsonFormatOptions = { indent: 2 },
): Result<{ output: string; parsed: unknown }, JsonSyntaxErrorDetail> {
  const trimmed = input.trim();
  if (!trimmed) {
    return err({ message: 'Input is empty. Please enter valid JSON.' });
  }

  try {
    let parsed = JSON.parse(trimmed);
    if (options.sortKeys) {
      parsed = sortJsonKeys(parsed);
    }
    const output = JSON.stringify(parsed, null, options.indent);
    return ok({ output, parsed });
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'Invalid JSON syntax.';
    const pos = extractErrorPosition(rawMsg, input);
    return err({
      message: rawMsg,
      line: pos.line,
      column: pos.column,
    });
  }
}

/**
 * Minifies JSON by stripping all indentation and whitespace outside string literals.
 */
export function minifyJson(input: string): Result<string, JsonSyntaxErrorDetail> {
  const res = formatJson(input, { indent: 0 });
  if (!res.ok) return res;
  return ok(JSON.stringify(res.value.parsed));
}
