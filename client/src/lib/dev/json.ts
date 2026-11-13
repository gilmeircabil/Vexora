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

// Recursively sorts the keys of an object alphabetically
function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    const sortedList: unknown[] = [];
    for (let i = 0; i < value.length; i++) {
      sortedList.push(sortJsonKeys(value[i]));
    }
    return sortedList;
  }

  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: Record<string, unknown> = {};

    for (const key of sortedKeys) {
      sortedObj[key] = sortJsonKeys(obj[key]);
    }
    return sortedObj;
  }

  return value;
}

/**
 * Extracts line and column numbers from JSON.parse error messages when available.
 */
function extractErrorPosition(errorMsg: string, input: string): { line?: number; column?: number } {
  // Check for "line X column Y" format
  const lineColMatch = errorMsg.match(/line (\d+) column (\d+)/i);
  if (lineColMatch && lineColMatch[1] && lineColMatch[2]) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  // Check for "at position X" format
  const posMatch = errorMsg.match(/at position (\d+)/i);
  if (posMatch && posMatch[1]) {
    const position = parseInt(posMatch[1], 10);
    const textBeforeError = input.slice(0, position);
    const lines = textBeforeError.split('\n');
    const lastLine = lines[lines.length - 1] || '';

    return {
      line: lines.length,
      column: lastLine.length + 1,
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
    const position = extractErrorPosition(rawMsg, input);
    return err({
      message: rawMsg,
      line: position.line,
      column: position.column,
    });
  }
}

/**
 * Minifies JSON by stripping indentation and unnecessary whitespace.
 */
export function minifyJson(input: string): Result<string, JsonSyntaxErrorDetail> {
  const res = formatJson(input, { indent: 0 });
  if (!res.ok) {
    return res;
  }
  return ok(JSON.stringify(res.value.parsed));
}
