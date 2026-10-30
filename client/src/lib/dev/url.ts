import { Result, ok, err } from '../result.js';

export function encodeUrl(input: string, mode: 'component' | 'full' = 'component'): string {
  if (!input) return '';
  return mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
}

export function decodeUrl(
  input: string,
  mode: 'component' | 'full' = 'component',
): Result<string, string> {
  if (!input) return ok('');
  try {
    return ok(mode === 'component' ? decodeURIComponent(input) : decodeURI(input));
  } catch (e) {
    return err(
      'Malformed URI sequence. Ensure percentage escape sequences (e.g. %20) are valid hex.',
    );
  }
}
